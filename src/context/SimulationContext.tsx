import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import { Vector3 } from 'three';
import { useDebouncedCallback } from 'use-debounce';

import { SIMULATION_CSV_FILES } from '@/config/simulation';
import {
  UseHouseComponentsReturnType,
  useHouseComponents,
} from '@/hooks/useHouseComponents';
import { HouseComponentsConfigurator } from '@/models/HouseComponentsConfigurator';
import {
  createDefault,
  simulationHistory,
} from '@/reducer/simulationHistoryReducer';
import { FormattedHeatLoss } from '@/types/heatLoss';
import { HeatLossPerComponent } from '@/types/houseComponent';
import { SimulationStatus } from '@/types/simulation';
import { TemperatureRow, UserOutdoorTemperature } from '@/types/temperatures';
import { FormattedTime, TimeUnit } from '@/types/time';
import { WindowScaleSize, WindowSizeType } from '@/types/window';
import { undefinedContextErrorFactory } from '@/utils/context';
import { formatHeatLossRate } from '@/utils/heatLoss';
import {
  getOutdoorTemperature,
  loadTemperaturesFromCSV,
} from '@/utils/temperatures';

type SpeedState = {
  text: string;
  multiply: number;
};

const SPEED_STATES: SpeedState[] = [
  { text: 'x1', multiply: 1 },
  { text: 'x3', multiply: 3 },
  { text: 'x5', multiply: 5 },
];

// TODO: regroup by type like windowSize: { value, update }...
type SimulationContextType = UseHouseComponentsReturnType & {
  status: SimulationStatus;
  heatLossPerComponent: HeatLossPerComponent;
  heatLoss: number;
  totalHeatLoss: FormattedHeatLoss;
  electricityCost: number;
  pricekWh: number;
  setPricekWh: (newPrice: number) => void;
  indoorTemperature: number;
  updateIndoorTemperature: (newTemperature: number) => void;
  outdoorTemperature: UserOutdoorTemperature;
  updateOutdoorTemperature: (props: {
    override: boolean;
    value: number;
  }) => void;
  date: Date;
  duration: FormattedTime;
  numberOfDays: number;
  updateSimulationDuration: (
    duration: Pick<FormattedTime, 'value'> & { unit: typeof TimeUnit.Years },
  ) => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  currDayIdx: number;
  gotToDay: (idx: number) => void;
  getDateOf: (idx: number) => Date;
  windowScaleSize: Vector3;
  windowSize: WindowSizeType;
  updateWindowSize: (newSize: WindowSizeType) => void;
  numberOfFloors: number;
  updateNumberOfFloors: (numberOfFloors: number) => void;
  houseComponentsConfigurator: HouseComponentsConfigurator;
  speed: string;
  nextSpeed: () => void;
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
  // Refs
  const simulationIntervalId = useRef<NodeJS.Timeout | null>(null);
  const temperatures = useRef<TemperatureRow[]>([
    {
      time: new Date().toLocaleString(),
      temperature: Number.NaN,
    },
  ]);

  // States
  const [simulationDuration, setSimulationDuration] = useState<FormattedTime>({
    value: 1,
    unit: TimeUnit.Years,
  });
  const [simulationStatus, setSimulationStatus] = useState<SimulationStatus>(
    SimulationStatus.LOADING, // waiting for the temperatures...
  );
  const [simulationSpeedIdx, setSimulationSpeedIdx] = useState(0);

  // Computed states
  const csv =
    SIMULATION_CSV_FILES[
      simulationDuration.value as keyof typeof SIMULATION_CSV_FILES
    ];
  const numberOfDays = temperatures.current.length; // We assume it is one temperature per day.
  const [
    { simulationDays, currentDayIdx, simulationSettings },
    dispatchHistory,
  ] = useReducer(simulationHistory, createDefault());
  const currentDay = simulationDays[currentDayIdx];

  // Hooks
  const houseComponentsHook = useHouseComponents({
    houseConfigurator: simulationSettings.houseConfigurator,
    onChange: (houseConfigurator) => {
      dispatchHistory({
        type: 'updateHouseConfigurator',
        houseConfigurator,
      });
    },
  });

  const resetSimulation = useCallback(() => {
    dispatchHistory({
      type: 'reset',
      temperatureRows: temperatures.current,
    });
  }, []);

  // Load CSV
  useEffect(() => {
    if (!csv) {
      throw new Error(
        `The CSV was not found for the duration of ${simulationDuration.value}`,
      );
    }

    loadTemperaturesFromCSV(csv.path).then((rows) => {
      temperatures.current = rows;
      resetSimulation();
    });
  }, [
    csv,
    csv.measurementFrequency,
    csv.path,
    resetSimulation,
    simulationDuration.value,
  ]);

  useEffect(() => {
    // Only set the status from LOADING to IDLE when the heat loss is computed.
    if (
      simulationStatus === SimulationStatus.LOADING &&
      currentDay.heatLoss?.global
    ) {
      setSimulationStatus(SimulationStatus.IDLE);
    }
  }, [currentDay, simulationStatus]);

  // Simulation Status Command
  const startSimulation = useCallback((): void => {
    if (temperatures.current.length === 0) {
      throw new Error('The temperatures are not loaded!');
    }

    if (
      simulationStatus === SimulationStatus.RUNNING ||
      simulationStatus === SimulationStatus.LOADING
    ) {
      return;
    }

    if (simulationStatus === SimulationStatus.FINISHED) {
      resetSimulation();
    }

    setSimulationStatus(SimulationStatus.RUNNING);
  }, [resetSimulation, simulationStatus]);

  const pauseSimulation = useCallback((): void => {
    if (
      simulationStatus === SimulationStatus.RUNNING &&
      simulationIntervalId.current
    ) {
      clearInterval(simulationIntervalId.current);
    }

    setSimulationStatus(SimulationStatus.PAUSED);
  }, [simulationStatus]);

  // The useDebouncedCallback function is used to avoid modifying days too quickly
  // and creating too many new days.
  const gotToDay = useDebouncedCallback((idx: number): void => {
    pauseSimulation();
    dispatchHistory({ type: 'goToDay', dayIdx: idx });
  }, 10);

  // Handle the simulation's iterations
  useEffect(() => {
    if (simulationStatus === SimulationStatus.RUNNING) {
      simulationIntervalId.current = setInterval(() => {
        const nextIdx = currentDayIdx + 1;
        if (nextIdx < numberOfDays) {
          // Go to next day.
          dispatchHistory({ type: 'goToDay', dayIdx: nextIdx });
        } else {
          setSimulationStatus(SimulationStatus.FINISHED);
        }
      }, simulationFrameMS / SPEED_STATES[simulationSpeedIdx].multiply);
    }

    return () => {
      // Cleanup on unmount or status change
      if (simulationIntervalId.current) {
        clearInterval(simulationIntervalId.current);
      }
    };
  }, [
    simulationStatus,
    numberOfDays,
    simulationFrameMS,
    dispatchHistory,
    currentDayIdx,
    simulationSpeedIdx,
  ]);

  // Update simulation's current state
  const updateNumberOfFloors = useCallback((numberOfFloors: number) => {
    if (numberOfFloors < 1 || numberOfFloors > 2) {
      throw new Error('The number of floors must be between [1, 2]');
    }

    dispatchHistory({
      type: 'updateNumberOfFloors',
      numberOfFloors,
    });
  }, []);

  const updateOutdoorTemperature = useCallback(
    ({ override, value }: { override: boolean; value: number }): void => {
      dispatchHistory({
        type: 'updateOutdoorTemperature',
        outdoorTemperature: {
          userOverride: override,
          value,
        },
      });
    },
    [],
  );

  const updateIndoorTemperature = useCallback((value: number): void => {
    dispatchHistory({
      type: 'updateIndoorTemperature',
      indoorTemperature: value,
    });
  }, []);

  const updatePricekWh = useCallback((value: number): void => {
    dispatchHistory({
      type: 'updatePricekWh',
      pricekWh: value,
    });
  }, []);

  const updateSimulationDuration = useCallback(
    (
      duration: Pick<FormattedTime, 'value'> & {
        unit: typeof TimeUnit.Years;
      },
    ): void => {
      setSimulationDuration(duration);
    },
    [],
  );

  const updateWindowSize = useCallback((newSize: WindowSizeType): void => {
    dispatchHistory({
      type: 'updateWindowSize',
      windowSize: newSize,
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      indoorTemperature: simulationSettings.indoorTemperature,
      updateIndoorTemperature,
      outdoorTemperature: {
        ...simulationSettings.outdoorTemperature,
        value: getOutdoorTemperature({
          userTemperature: simulationSettings.outdoorTemperature,
          weather: currentDay.weatherTemperature,
        }),
      },
      updateOutdoorTemperature,
      date: new Date(temperatures.current[currentDayIdx]?.time),
      getDateOf: (idx: number) => new Date(temperatures.current[idx]?.time),
      duration: simulationDuration,
      numberOfDays,
      updateSimulationDuration,
      status: simulationStatus,
      heatLossPerComponent: currentDay.heatLoss.perComponent ?? 0,
      heatLoss: currentDay.heatLoss.global,
      totalHeatLoss: formatHeatLossRate(currentDay.totalHeatLoss),
      electricityCost: currentDay.totalElectricityCost,
      pricekWh: simulationSettings.pricekWh,
      setPricekWh: updatePricekWh,
      startSimulation,
      pauseSimulation,
      currDayIdx: currentDayIdx,
      gotToDay,
      windowSize: simulationSettings.windowSize,
      windowScaleSize: WindowScaleSize[simulationSettings.windowSize],
      updateWindowSize,
      numberOfFloors: simulationSettings.numberOfFloors,
      updateNumberOfFloors,
      houseComponentsConfigurator: simulationSettings.houseConfigurator,
      speed: SPEED_STATES[simulationSpeedIdx].text,
      nextSpeed: () =>
        setSimulationSpeedIdx((curr) => (curr + 1) % SPEED_STATES.length),
      ...houseComponentsHook,
    }),
    [
      simulationSettings.indoorTemperature,
      simulationSettings.outdoorTemperature,
      simulationSettings.pricekWh,
      simulationSettings.windowSize,
      simulationSettings.numberOfFloors,
      simulationSettings.houseConfigurator,
      updateIndoorTemperature,
      currentDay.weatherTemperature,
      currentDay.heatLoss.perComponent,
      currentDay.heatLoss.global,
      currentDay.totalHeatLoss,
      currentDay.totalElectricityCost,
      updateOutdoorTemperature,
      currentDayIdx,
      simulationDuration,
      numberOfDays,
      updateSimulationDuration,
      simulationStatus,
      updatePricekWh,
      startSimulation,
      pauseSimulation,
      gotToDay,
      updateWindowSize,
      updateNumberOfFloors,
      simulationSpeedIdx,
      houseComponentsHook,
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
