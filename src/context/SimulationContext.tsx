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

import { SIMULATION_CSV_FILES, WeatherLocation } from '@/config/simulation';
import {
  UseHouseComponentsReturnType,
  useHouseComponents,
} from '@/hooks/useHouseComponents';
import {
  SimulationDay,
  createDefault,
  simulationHistory,
} from '@/reducer/simulationHistoryReducer';
import { FormattedHeatLoss } from '@/types/heatLoss';
import {
  HeatLossPerComponent,
  HeatLossPerComponentEntries,
} from '@/types/houseComponent';
import { SimulationStatus } from '@/types/simulation';
import { TemperatureRow, UserOutdoorTemperature } from '@/types/temperatures';
import { NonEmptyArray } from '@/types/utils';
import { WindowScaleSize, WindowSizeType } from '@/types/window';
import { undefinedContextErrorFactory } from '@/utils/context';
import {
  calculateHeatLossConstantFactor,
  formatHeatLossRate,
} from '@/utils/heatLoss';
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

type SimulationContextType = {
  simulation: {
    status: SimulationStatus;
    start: () => void;
    pause: () => void;
    date: Date;
    duration: {
      years: number;
      update: ({ durationInYears }: { durationInYears: number }) => void;
    };
    location: {
      value: WeatherLocation;
      update: (newLocation: WeatherLocation) => void;
    };
    days: {
      total: number;
      currentIdx: number;
      simulationDays: NonEmptyArray<SimulationDay>;
      goToDay: (idx: number) => void;
      getDateOf: (idx: number) => Date;
    };
    speed: {
      current: string;
      next: () => void;
    };
  };
  heatLoss: {
    global: number;
    perComponent: HeatLossPerComponent;
    total: FormattedHeatLoss;
  };
  electricity: {
    cost: number;
    pricekWh: number;
    updatePricekWh: (newPrice: number) => void;
  };
  temperatures: {
    indoor: number;
    updateIndoor: (newTemperature: number) => void;
    outdoor: UserOutdoorTemperature;
    updateOutdoor: (props: { override: boolean; value: number }) => void;
  };
  house: UseHouseComponentsReturnType & {
    window: {
      scaleSize: Vector3;
      size: WindowSizeType;
      updateSize: (newSize: WindowSizeType) => void;
    };
    numberOfFloors: number;
    updateNumberOfFloors: (numberOfFloors: number) => void;
  };
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
  const [simulationDurationInYears, setSimulationDurationInYears] = useState(1);
  const [location, setLocation] = useState<WeatherLocation>('ECUBLENS');
  const [simulationStatus, setSimulationStatus] = useState<SimulationStatus>(
    SimulationStatus.INITIAL_LOADING, // waiting for the temperatures...
  );
  const [simulationSpeedIdx, setSimulationSpeedIdx] = useState(0);

  // Computed states
  const csv =
    SIMULATION_CSV_FILES[location][
      simulationDurationInYears as keyof (typeof SIMULATION_CSV_FILES)[typeof location]
    ];
  const numberOfDays = temperatures.current.length; // We assume it is one temperature per day.
  const [
    { simulationDays, currentDayIdx, simulationSettings },
    dispatchHistory,
  ] = useReducer(simulationHistory, createDefault());
  const currentDay = simulationDays[currentDayIdx];

  // Hooks
  const houseComponentsHook = useHouseComponents();

  // Transform in array here for performances in the SimulationHeatLoss.
  // Otherwise, the transformation will be executed on each changes vs once here.
  const heatLossConstantFactors: HeatLossPerComponentEntries = useMemo(
    () =>
      Object.entries(
        houseComponentsHook.all.reduce<HeatLossPerComponent>(
          (acc, c) => ({
            ...acc,
            [c.houseComponentId]: calculateHeatLossConstantFactor({
              area: c.actualArea,
              materials: c.buildingMaterials,
            }),
          }),
          {},
        ),
      ),
    [houseComponentsHook.all],
  );

  useEffect(
    () =>
      dispatchHistory({
        type: 'updateConstantFactors',
        heatLossConstantFactors,
      }),
    [heatLossConstantFactors],
  );

  // Load CSV
  useEffect(() => {
    if (!csv) {
      throw new Error(
        `The CSV was not found for the duration of ${simulationDurationInYears}`,
      );
    }

    loadTemperaturesFromCSV(csv).then((rows) => {
      temperatures.current = rows;
      dispatchHistory({
        type: 'load',
        temperatureRows: rows,
      });
      setSimulationStatus(SimulationStatus.LOADING);
    });
  }, [csv, simulationDurationInYears]);

  useEffect(() => {
    // Only set the status from LOADING to IDLE when the heat loss is computed.
    if (
      simulationStatus === SimulationStatus.LOADING &&
      // This check is to ensure the heat loss was computed.
      // If for some reason the computed heat loss is zero, this condition should be adapted.
      currentDay.heatLoss?.global !== 0
    ) {
      setSimulationStatus(SimulationStatus.IDLE);
    }
  }, [currentDay, simulationStatus]);

  // Simulation Status Command
  const startSimulation = useCallback((): void => {
    if (temperatures.current.length === 0) {
      throw new Error('The temperatures are not loaded!');
    }

    if (simulationStatus === SimulationStatus.FINISHED) {
      dispatchHistory({
        type: 'restart',
      });
    }

    if (
      simulationStatus === SimulationStatus.RUNNING ||
      simulationStatus === SimulationStatus.LOADING
    ) {
      return;
    }

    setSimulationStatus(SimulationStatus.RUNNING);
  }, [simulationStatus]);

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
  const goToDay = useDebouncedCallback((idx: number): void => {
    pauseSimulation();

    if (idx >= numberOfDays - 1) {
      setSimulationStatus(SimulationStatus.FINISHED);
    }

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
    ({ durationInYears }: { durationInYears: number }): void => {
      setSimulationDurationInYears(durationInYears);
    },
    [],
  );

  const updateSimulationLocation = useCallback(
    (newLocation: WeatherLocation): void => {
      setLocation(newLocation);
    },
    [],
  );

  const updateWindowSize = useCallback((newSize: WindowSizeType): void => {
    dispatchHistory({
      type: 'updateWindowSize',
      windowSize: newSize,
    });
  }, []);

  const contextValue = useMemo(() => {
    const {
      weatherTemperature,
      heatLoss,
      totalHeatLoss,
      totalElectricityCost,
    } = currentDay;

    const {
      indoorTemperature,
      outdoorTemperature,
      pricekWh,
      windowSize,
      numberOfFloors,
    } = simulationSettings;

    return {
      simulation: {
        status: simulationStatus,
        start: startSimulation,
        pause: pauseSimulation,
        date: currentDay.date,
        duration: {
          years: simulationDurationInYears,
          update: updateSimulationDuration,
        },
        location: {
          value: location,
          update: updateSimulationLocation,
        },
        days: {
          total: numberOfDays,
          currentIdx: currentDayIdx,
          simulationDays,
          goToDay,
          getDateOf: (idx: number) => simulationDays[idx].date,
        },
        speed: {
          current: SPEED_STATES[simulationSpeedIdx].text,
          next: () =>
            setSimulationSpeedIdx((curr) => (curr + 1) % SPEED_STATES.length),
        },
      },
      heatLoss: {
        global: heatLoss.global,
        perComponent: heatLoss.perComponent ?? 0,
        total: formatHeatLossRate(totalHeatLoss),
      },
      electricity: {
        cost: totalElectricityCost,
        pricekWh,
        updatePricekWh,
      },
      temperatures: {
        indoor: indoorTemperature,
        updateIndoor: updateIndoorTemperature,
        outdoor: {
          ...outdoorTemperature,
          value: getOutdoorTemperature({
            userTemperature: outdoorTemperature,
            weather: weatherTemperature,
          }),
        },
        updateOutdoor: updateOutdoorTemperature,
      },
      house: {
        window: {
          size: windowSize,
          scaleSize: WindowScaleSize[windowSize],
          updateSize: updateWindowSize,
        },
        numberOfFloors,
        updateNumberOfFloors,
        ...houseComponentsHook,
      },
    };
  }, [
    currentDay,
    simulationSettings,
    simulationStatus,
    startSimulation,
    pauseSimulation,
    simulationDurationInYears,
    updateSimulationDuration,
    location,
    updateSimulationLocation,
    numberOfDays,
    currentDayIdx,
    simulationDays,
    goToDay,
    simulationSpeedIdx,
    updatePricekWh,
    updateIndoorTemperature,
    updateOutdoorTemperature,
    updateWindowSize,
    updateNumberOfFloors,
    houseComponentsHook,
  ]);

  return (
    <SimulationContext.Provider value={contextValue}>
      {children}
    </SimulationContext.Provider>
  );
};

type SimulationContextKey = keyof SimulationContextType | undefined;
type UseSimulationReturnType<K extends SimulationContextKey> =
  K extends undefined
    ? SimulationContextType
    : SimulationContextType[NonNullable<K>];

export const useSimulation = <K extends SimulationContextKey = undefined>(
  prefix?: K,
): UseSimulationReturnType<K> => {
  const context = useContext(SimulationContext);

  if (!context) {
    throw undefinedContextErrorFactory('Simulation');
  }

  if (prefix) {
    return context[prefix] as UseSimulationReturnType<K>;
  }

  return context as UseSimulationReturnType<K>;
};
