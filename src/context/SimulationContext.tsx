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
  SIMULATION_AREA_M_SQUARE,
  SIMULATION_DEFAULT_MATERIAL,
  SIMULATION_INDOOR_TEMPERATURE_CELCIUS,
  SIMULATION_PRICE_KWH,
} from '@/config/simulation';
import { useHeatLoss } from '@/hooks/useHeatLoss';
import { useSimulationProgression } from '@/hooks/useSimulationProgression';
import { FormattedHeatLoss } from '@/types/heatLoss';
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

const SIMULATION_ERROR_CONTEXT = undefinedContextErrorFactory('Simulation');

type SimulationContextType = {
  status: SimulationStatus;
  heatLoss: FormattedHeatLoss;
  totalHeatLoss: FormattedHeatLoss;
  electricityCost: number;
  indoorTemperature: number;
  outdoorTemperature: number;
  progression: SimulationProgression;
  period: SlidingWindow['period'];
  duration: FormattedTime;
  material: Material;
  startSimulation: () => void;
};

const SimulationContext = createContext<SimulationContextType>({
  status: SimulationStatus.IDLE,
  heatLoss: { value: 0, unit: 'W' },
  totalHeatLoss: { value: 0, unit: 'W' },
  electricityCost: 0,
  indoorTemperature: 0,
  outdoorTemperature: 0,
  progression: { progress: 0, timeLeft: 0 },
  period: { from: new Date(), to: new Date(), durationInHours: 0 },
  duration: { value: 0, unit: TimeUnit.Hours },
  material: { price: 0, thermalConductivity: 0, thickness: 0 },
  startSimulation: () => {
    throw SIMULATION_ERROR_CONTEXT;
  },
});

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
  const area = SIMULATION_AREA_M_SQUARE;
  const material: Material = SIMULATION_DEFAULT_MATERIAL;
  const pricekWh = SIMULATION_PRICE_KWH;

  const { heatLoss, totalHeatLoss } = useHeatLoss({
    material,
    area,
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
      material,
      status: simulationStatus,
      heatLoss: formatHeatLossRate(heatLoss),
      totalHeatLoss: formatHeatLossRate(totalHeatLoss),
      electricityCost: electricityCost({
        pricekWh,
        totalEnergyConsumptionkWh:
          totalHeatLoss / powerConversionFactors.KiloWatt,
      }),
      startSimulation,
    }),
    [
      currentWindow.mean,
      currentWindow.period,
      heatLoss,
      indoorTemperature,
      material,
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

export const useSimulation = (): SimulationContextType =>
  useContext<SimulationContextType>(SimulationContext);
