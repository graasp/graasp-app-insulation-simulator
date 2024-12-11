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
import { SimulationCommand } from '@/models/SimulationCommand';
import { simulationHistory } from '@/reducer/simulationHistoryReducer';
import { FormattedHeatLoss } from '@/types/heatLoss';
import { HeatLossPerComponent } from '@/types/houseComponent';
import { SimulationStatus } from '@/types/simulation';
import { OutdoorTemperature, TemperatureRow } from '@/types/temperatures';
import { FormattedTime, TimeUnit } from '@/types/time';
import { WindowScaleSize, WindowSizeType } from '@/types/window';
import { undefinedContextErrorFactory } from '@/utils/context';
import { electricityCost } from '@/utils/electricity';
import { formatHeatLossRate, powerConversionFactors } from '@/utils/heatLoss';
import { loadTemperaturesFromCSV } from '@/utils/temperatures';

import { useHouseComponents } from './HouseComponentsContext';

// TODO: regroup by type like windowSize: { value, update }...
type SimulationContextType = {
  status: SimulationStatus;
  heatLossPerComponent: HeatLossPerComponent;
  heatLoss: number;
  totalHeatLoss: FormattedHeatLoss;
  electricityCost: number;
  pricekWh: number;
  setPricekWh: (newPrice: number) => void;
  indoorTemperature: number;
  updateIndoorTemperature: (newTemperature: number) => void;
  outdoorTemperature: OutdoorTemperature;
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
  // Hooks
  const {
    houseComponentsConfigurator,
    numberOfFloors,
    updateNumberOfFloors,
    replaceHouseComponentsConfigurator,
  } = useHouseComponents();

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

  // Computed states
  const csv =
    SIMULATION_CSV_FILES[
      simulationDuration.value as keyof typeof SIMULATION_CSV_FILES
    ];
  // TODO: accept multiple temperatures per day => TemperatureRow{date, meanTemperature}[]
  const numberOfRows = temperatures.current.length; // We assume it is one temperature per day for now
  const [{ past: history }, dispatchHistory] = useReducer(simulationHistory, {
    past: [
      SimulationCommand.createDefault({
        numberOfFloors,
        houseConfigurator: houseComponentsConfigurator,
      }),
    ],
    futur: [],
  });
  const currDayIdx = history.length - 1;
  const currentCommand = history[currDayIdx];

  const resetSimulation = useCallback(() => {
    dispatchHistory({
      type: 'reset',
      outdoorTemperature: {
        weatherValue: temperatures.current[0].temperature,
      },
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
      setSimulationStatus(SimulationStatus.IDLE);
      resetSimulation();
    });
  }, [
    csv,
    csv.measurementFrequency,
    csv.path,
    resetSimulation,
    simulationDuration.value,
  ]);

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

  const goToFutur = useCallback(
    (idx: number): void => {
      if (idx > numberOfRows - 1) {
        console.warn(
          `goToFutur: ignoring because idx ${idx} > last day ${numberOfRows - 1}.`,
        );
        return;
      }

      const { userOverride, value } = history[currDayIdx].outdoorTemperature;

      const outdoorTemperatures = temperatures.current
        .slice(currDayIdx + 1, idx + 1)
        .map(({ temperature: weatherValue }) => ({
          userOverride,
          weatherValue,
          value: userOverride ? value : weatherValue,
        }));

      dispatchHistory({
        type: 'goToFutur',
        outdoorTemperatures,
      });
    },
    [currDayIdx, history, numberOfRows],
  );

  const goToPast = useCallback(
    (idx: number): void => {
      if (idx < 0) {
        console.warn(`goToPast: ignoring because idx ${idx} < 0.`);
        return;
      }
      replaceHouseComponentsConfigurator(history[idx].houseConfigurator);
      updateNumberOfFloors(history[idx].numberOfFloors);
      dispatchHistory({ type: 'goToPast', idx });
    },
    [history, replaceHouseComponentsConfigurator, updateNumberOfFloors],
  );

  // The useDebouncedCallback function is used to avoid modifying days too quickly
  // and creating too many new days.
  const gotToDay = useDebouncedCallback((idx: number): void => {
    pauseSimulation();
    if (idx < currDayIdx) {
      goToPast(idx);
    } else if (idx >= currDayIdx) {
      goToFutur(idx);
    }
  }, 10);

  // Handle the simulation's iterations
  useEffect(() => {
    if (simulationStatus === SimulationStatus.RUNNING) {
      simulationIntervalId.current = setInterval(() => {
        const nextIdx = currDayIdx + 1;
        if (nextIdx < numberOfRows) {
          goToFutur(nextIdx);
        } else {
          setSimulationStatus(SimulationStatus.FINISHED);
        }
      }, simulationFrameMS);
    }

    return () => {
      // Cleanup on unmount or status change
      if (simulationIntervalId.current) {
        clearInterval(simulationIntervalId.current);
      }
    };
  }, [
    simulationStatus,
    numberOfRows,
    simulationFrameMS,
    history,
    dispatchHistory,
    currDayIdx,
    goToFutur,
  ]);

  // Update simulation's current state
  useEffect(() => {
    dispatchHistory({
      type: 'updateHouseConfigurator',
      houseConfigurator: houseComponentsConfigurator,
    });
  }, [houseComponentsConfigurator]);

  useEffect(() => {
    dispatchHistory({
      type: 'updateNumberOfFloors',
      numberOfFloors,
    });
  }, [numberOfFloors]);

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
      indoorTemperature: currentCommand.indoorTemperature,
      updateIndoorTemperature,
      outdoorTemperature: currentCommand.outdoorTemperature,
      updateOutdoorTemperature,
      date: new Date(temperatures.current[currDayIdx]?.time),
      getDateOf: (idx: number) => new Date(temperatures.current[idx]?.time),
      duration: simulationDuration,
      numberOfDays: simulationDuration.value * 365, // TODO: simplify by setting duration in years...
      updateSimulationDuration,
      status: simulationStatus,
      heatLossPerComponent: currentCommand.heatLoss.perComponent,
      heatLoss: currentCommand.heatLoss.global,
      totalHeatLoss: formatHeatLossRate(
        currentCommand.prevTotHeatLoss + currentCommand.heatLoss.global,
      ),
      electricityCost:
        currentCommand.prevTotPowerCost +
        electricityCost({
          pricekWh: currentCommand.pricekWh,
          energyConsumptionkWh:
            currentCommand.heatLoss.global / powerConversionFactors.KiloWatt,
        }),
      pricekWh: currentCommand.pricekWh,
      setPricekWh: updatePricekWh,
      startSimulation,
      pauseSimulation,
      currDayIdx,
      gotToDay,

      windowSize: currentCommand.windowSize,
      windowScaleSize: WindowScaleSize[currentCommand.windowSize],
      updateWindowSize,
    }),
    [
      currentCommand.indoorTemperature,
      currentCommand.outdoorTemperature,
      currentCommand.heatLoss.perComponent,
      currentCommand.heatLoss.global,
      currentCommand.prevTotHeatLoss,
      currentCommand.prevTotPowerCost,
      currentCommand.pricekWh,
      currentCommand.windowSize,
      updateIndoorTemperature,
      updateOutdoorTemperature,
      currDayIdx,
      simulationDuration,
      updateSimulationDuration,
      simulationStatus,
      updatePricekWh,
      startSimulation,
      pauseSimulation,
      gotToDay,
      updateWindowSize,
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
