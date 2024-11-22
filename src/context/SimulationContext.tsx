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
  SIMULATION_DEFAULT_MATERIAL,
  SIMULATION_INDOOR_TEMPERATURE_CELCIUS,
  SIMULATION_PRICE_KWH,
} from '@/config/simulation';
import { useHeatLoss } from '@/hooks/useHeatLoss';
import {
  RegisterComponentParams,
  useHouseComponents,
} from '@/hooks/useHouseComponents';
import { useSimulationProgression } from '@/hooks/useSimulationProgression';
import { FormattedHeatLoss } from '@/types/heatLoss';
import {
  HeatLossPerComponent,
  HouseComponentType,
} from '@/types/houseComponent';
import { Material } from '@/types/material';
import { SimulationProgression, SimulationStatus } from '@/types/simulation';
import { SlidingWindow } from '@/types/temperatures';
import { FormattedTime, TimeUnit, TimeUnitType } from '@/types/time';
import { undefinedContextErrorFactory } from '@/utils/context';
import { electricityCost } from '@/utils/electricity';
import { formatHeatLossRate, powerConversionFactors } from '@/utils/heatLoss';
import { loadTemperaturesFromCSV } from '@/utils/temperatures';
import { formatHours, timeConversionFactors } from '@/utils/time';

import {
  TemperatureIterator,
  initSlidingWindow,
} from '../models/TemperatureIterator';

type SimulationContextType = {
  status: SimulationStatus;
  heatLosses: HeatLossPerComponent;
  totalHeatLoss: FormattedHeatLoss;
  electricityCost: number;
  indoorTemperature: number;
  outdoorTemperature: number;
  progression: SimulationProgression;
  period: SlidingWindow['period'];
  duration: FormattedTime;
  materials: Map<HouseComponentType, Material>;
  startSimulation: () => void;
  registerComponent: (params: RegisterComponentParams) => void;
};

const SimulationContext = createContext<SimulationContextType | null>(null);

type Props = {
  children: ReactNode;
  /**
   *
   * @param path The file path of the CSV containing the temperatures.
   * @param measurementFrequency - The time unit corresponding to the frequency of the temperature measurements.
   *                               Indicates whether the temperatures are recorded once per hour, once per day, etc.
   */
  csv: { path: string; measurementFrequency: TimeUnitType };
  simulationFrameMS: number;
};

export const SimulationProvider = ({
  children,
  csv,
  simulationFrameMS,
}: Props): ReactNode => {
  const [simulationStatus, setSimulationStatus] = useState<SimulationStatus>(
    SimulationStatus.IDLE,
  );
  const temperatureIterator = useRef<TemperatureIterator>();
  const [currentWindow, setCurrentWindow] = useState<SlidingWindow>(
    initSlidingWindow(0),
  );
  const [simulationDuration, setSimulationDuration] = useState<FormattedTime>({
    value: 0,
    unit: TimeUnit.Hours,
  });

  // TODO: These parameters will be changed by the user
  const indoorTemperature = SIMULATION_INDOOR_TEMPERATURE_CELCIUS;
  const materials: Map<HouseComponentType, Material> = useMemo(
    () => new Map([[HouseComponentType.Wall, SIMULATION_DEFAULT_MATERIAL]]),
    [],
  );
  const pricekWh = SIMULATION_PRICE_KWH;

  const { houseComponents, registerComponent } = useHouseComponents({
    materials,
  });

  const { heatLosses, totalHeatLoss } = useHeatLoss({
    houseComponents,
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
        setCurrentWindow(temperatureIterator.current.getNext());
      } else {
        clearInterval(intervalId);
        setSimulationStatus(SimulationStatus.FINISHED);
      }
    }, simulationFrameMS);
  }, [simulationFrameMS, simulationStatus]);

  const contextValue = useMemo(
    () => ({
      indoorTemperature,
      outdoorTemperature: currentWindow.mean,
      period: currentWindow.period,
      progression,
      duration: simulationDuration,
      materials,
      status: simulationStatus,
      heatLosses,
      totalHeatLoss: formatHeatLossRate(totalHeatLoss),
      electricityCost: electricityCost({
        pricekWh,
        totalEnergyConsumptionkWh:
          totalHeatLoss / powerConversionFactors.KiloWatt,
      }),
      startSimulation,
      registerComponent,
    }),
    [
      currentWindow.mean,
      currentWindow.period,
      heatLosses,
      indoorTemperature,
      materials,
      pricekWh,
      progression,
      registerComponent,
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
