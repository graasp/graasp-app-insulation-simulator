import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  SIMULATION_CSV_FILES,
  SIMULATION_INDOOR_TEMPERATURE_CELCIUS,
  SIMULATION_OUTDOOR_TEMPERATURE_CELCIUS,
  SIMULATION_PRICE_KWH,
} from '@/config/simulation';
import { useHeatLoss } from '@/hooks/useHeatLoss';
import { useSimulationProgression } from '@/hooks/useSimulationProgression';
import { FormattedHeatLoss } from '@/types/heatLoss';
import { HeatLossPerComponent } from '@/types/houseComponent';
import { SimulationProgression, SimulationStatus } from '@/types/simulation';
import { SlidingWindow } from '@/types/temperatures';
import { FormattedTime, TimeUnit } from '@/types/time';
import { undefinedContextErrorFactory } from '@/utils/context';
import { electricityCost } from '@/utils/electricity';
import { formatHeatLossRate, powerConversionFactors } from '@/utils/heatLoss';
import { loadTemperaturesFromCSV } from '@/utils/temperatures';
import { formatHours, timeConversionFactors } from '@/utils/time';

import {
  TemperatureIterator,
  initSlidingWindow,
} from '../models/TemperatureIterator';
import { useHouseComponents } from './HouseComponentsContext';

type OutdoorTemperature = { override: boolean; value: number };

type SimulationContextType = {
  status: SimulationStatus;
  heatLosses: HeatLossPerComponent;
  totalHeatLoss: FormattedHeatLoss;
  electricityCost: number;
  setPricekWh: (newPrice: number) => void;
  indoorTemperature: number;
  updateIndoorTemperature: (newTemperature: number) => void;
  outdoorTemperature: OutdoorTemperature;
  updateOutdoorTemperature: (props: OutdoorTemperature) => void;
  progression: SimulationProgression;
  period: SlidingWindow['period'];
  duration: FormattedTime;
  updateSimulationDuration: (
    duration: Pick<FormattedTime, 'value'> & { unit: typeof TimeUnit.Years },
  ) => void;
  startSimulation: () => void;
};

const SimulationContext = createContext<SimulationContextType | null>(null);

type Props = {
  children: ReactNode;
  simulationFrameMS: number;
};

export const SimulationProvider = ({
  children,
  simulationFrameMS,
}: Props): ReactNode => {
  const temperatureIterator = useRef<TemperatureIterator>();

  const [simulationStatus, setSimulationStatus] = useState<SimulationStatus>(
    SimulationStatus.IDLE,
  );

  const [currentWindow, setCurrentWindow] = useState<SlidingWindow>(
    initSlidingWindow(0),
  );

  const [simulationDuration, setSimulationDuration] = useState<FormattedTime>({
    value: 1,
    unit: TimeUnit.Years,
  });

  const [indoorTemperature, setIndoorTemperature] = useState(
    SIMULATION_INDOOR_TEMPERATURE_CELCIUS.DEFAULT,
  );

  const [outdoorTemperature, setOutdoorTemperature] = useState({
    override: false,
    value: SIMULATION_OUTDOOR_TEMPERATURE_CELCIUS.DEFAULT,
  });

  const [pricekWh, setPricekWh] = useState(SIMULATION_PRICE_KWH);

  const csv =
    SIMULATION_CSV_FILES[
      simulationDuration.value as keyof typeof SIMULATION_CSV_FILES
    ];

  if (!csv) {
    throw new Error(
      `The CSV was not found for the duration of ${simulationDuration.value}`,
    );
  }

  const { houseComponentsConfigurator } = useHouseComponents();

  const { heatLosses, totalHeatLoss } = useHeatLoss({
    houseComponentsConfigurator,
    indoorTemperature,
    measurementFrequency: csv.measurementFrequency,
    temperatures: currentWindow.temperatures,
  });

  const { progression } = useSimulationProgression({
    currentWindow,
    simulationFrameMS,
  });

  useEffect(() => {
    setSimulationStatus(() => SimulationStatus.LOADING);
    loadTemperaturesFromCSV(csv.path).then((rows) => {
      temperatureIterator.current = new TemperatureIterator({
        temperatures: rows,
        measurementFrequency: csv.measurementFrequency,
      });

      const numberOfHours =
        rows.length * timeConversionFactors[csv.measurementFrequency];

      setSimulationDuration(formatHours(numberOfHours));
      setSimulationStatus(SimulationStatus.IDLE);
    });
  }, [csv.measurementFrequency, csv.path]);

  const startSimulation = useCallback((): void => {
    if (
      simulationStatus === SimulationStatus.RUNNING ||
      simulationStatus === SimulationStatus.LOADING
    ) {
      return;
    }

    if (!temperatureIterator.current) {
      throw new Error('The temperatures are not loaded!');
    }

    setSimulationStatus(SimulationStatus.RUNNING);
    temperatureIterator.current.reset();

    const intervalId = setInterval(() => {
      if (temperatureIterator.current?.hasMore()) {
        // TODO: should update this to use the overrided temperature in the calculation
        setCurrentWindow(temperatureIterator.current.getNext());
      } else {
        clearInterval(intervalId);
        setSimulationStatus(SimulationStatus.FINISHED);
      }
    }, simulationFrameMS);
  }, [simulationFrameMS, simulationStatus]);

  const updateOutdoorTemperature = ({
    override,
    value,
  }: {
    override: boolean;
    value: number;
  }): void => {
    setOutdoorTemperature({ override, value });
  };

  const contextValue = useMemo(
    () => ({
      indoorTemperature,
      updateIndoorTemperature: setIndoorTemperature,
      outdoorTemperature: {
        override: outdoorTemperature.override,
        value: outdoorTemperature.override
          ? outdoorTemperature.value
          : currentWindow.mean,
      },
      updateOutdoorTemperature,
      period: currentWindow.period,
      progression,
      duration: simulationDuration,
      updateSimulationDuration: (
        duration: Pick<FormattedTime, 'value'> & {
          unit: typeof TimeUnit.Years;
        },
      ) => setSimulationDuration(duration),
      status: simulationStatus,
      heatLosses,
      totalHeatLoss: formatHeatLossRate(totalHeatLoss),
      electricityCost: electricityCost({
        pricekWh,
        totalEnergyConsumptionkWh:
          totalHeatLoss / powerConversionFactors.KiloWatt,
      }),
      setPricekWh,
      startSimulation,
    }),
    [
      currentWindow.mean,
      currentWindow.period,
      heatLosses,
      indoorTemperature,
      outdoorTemperature.override,
      outdoorTemperature.value,
      pricekWh,
      progression,
      simulationDuration,
      simulationStatus,
      startSimulation,
      totalHeatLoss,
    ],
  );

  return (
    <SimulationContext.Provider value={contextValue}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = (): SimulationContextType => {
  const context = useContext(SimulationContext);

  if (!context) {
    throw undefinedContextErrorFactory('Simulation');
  }

  return context;
};
