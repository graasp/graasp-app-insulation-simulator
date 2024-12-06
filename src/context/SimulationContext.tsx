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

import { SIMULATION_CSV_FILES } from '@/config/simulation';
import { SimulationCommand } from '@/models/SimulationCommand';
import { simulationHistory } from '@/reducer/simulationHistoryReducer';
import { FormattedHeatLoss } from '@/types/heatLoss';
import { HeatLossPerComponent } from '@/types/houseComponent';
import { SimulationStatus } from '@/types/simulation';
import { OutdoorTemperature, TemperatureRow } from '@/types/temperatures';
import { FormattedTime, TimeUnit } from '@/types/time';
import { undefinedContextErrorFactory } from '@/utils/context';
import { electricityCost } from '@/utils/electricity';
import { formatHeatLossRate, powerConversionFactors } from '@/utils/heatLoss';
import { loadTemperaturesFromCSV } from '@/utils/temperatures';
import { formatHours, timeConversionFactors } from '@/utils/time';

import { useHouseComponents } from './HouseComponentsContext';

type SimulationContextType = {
  status: SimulationStatus;
  heatLossPerComponent: HeatLossPerComponent;
  heatLoss: number;
  totalHeatLoss: FormattedHeatLoss;
  electricityCost: number;
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
  updateSimulationDuration: (
    duration: Pick<FormattedTime, 'value'> & { unit: typeof TimeUnit.Years },
  ) => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
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
  const [simulationDuration, setSimulationDuration] = useState<FormattedTime>({
    value: 1,
    unit: TimeUnit.Years,
  });

  const currDayIdx = useRef(0);

  const temperatures = useRef<TemperatureRow[]>([
    {
      time: new Date().toLocaleString(),
      temperature: Number.NaN,
    },
  ]);

  const { houseComponentsConfigurator, numberOfFloors } = useHouseComponents();

  const csv =
    SIMULATION_CSV_FILES[
      simulationDuration.value as keyof typeof SIMULATION_CSV_FILES
    ];

  if (!csv) {
    throw new Error(
      `The CSV was not found for the duration of ${simulationDuration.value}`,
    );
  }

  // TODO: accept multiple temperatures per day => TemperatureRow{date, meanTemperature}[]
  const numberOfRows = temperatures.current.length; // We assume it is one temperature per day for now

  const [history, dispatchHistory] = useReducer(simulationHistory, [
    SimulationCommand.createDefault({
      numberOfFloors,
      houseConfigurator: houseComponentsConfigurator,
    }),
  ]);

  const currentCommand = history[currDayIdx.current];

  const [simulationStatus, setSimulationStatus] = useState<SimulationStatus>(
    SimulationStatus.LOADING, // waiting for the temperatures...
  );

  const resetSimulation = useCallback(() => {
    currDayIdx.current = 0;
    dispatchHistory({
      type: 'reset',
      outdoorTemperature: {
        value: temperatures.current[0].temperature,
      },
    });
  }, []);

  const simulationIntervalId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadTemperaturesFromCSV(csv.path).then((rows) => {
      temperatures.current = rows;
      setSimulationStatus(SimulationStatus.IDLE);
      resetSimulation();
    });
  }, [csv.measurementFrequency, csv.path, resetSimulation]);

  useEffect(() => {
    dispatchHistory({
      type: 'updateHouseConfigurator',
      index: currDayIdx.current,
      houseConfigurator: houseComponentsConfigurator,
    });
  }, [houseComponentsConfigurator]);

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

    simulationIntervalId.current = setInterval(() => {
      if (currDayIdx.current + 1 < numberOfRows) {
        dispatchHistory({
          type: 'add',
          command: currentCommand.from({
            outdoorTemperature: {
              ...currentCommand.outdoorTemperature,
              value: temperatures.current[currDayIdx.current + 1].temperature,
            },
          }),
        });
        currDayIdx.current += 1;
      } else if (simulationIntervalId.current) {
        clearInterval(simulationIntervalId.current);
        setSimulationStatus(SimulationStatus.FINISHED);
      }
    }, simulationFrameMS);
  }, [
    currentCommand,
    numberOfRows,
    resetSimulation,
    simulationFrameMS,
    simulationStatus,
  ]);

  const pauseSimulation = useCallback((): void => {
    if (
      simulationStatus === SimulationStatus.RUNNING &&
      simulationIntervalId.current
    ) {
      clearInterval(simulationIntervalId.current);
      setSimulationStatus(SimulationStatus.PAUSED);
    }
  }, [simulationStatus]);

  const updateOutdoorTemperature = useCallback(
    ({ override, value }: { override: boolean; value: number }): void => {
      dispatchHistory({
        type: 'updateOutdoorTemperature',
        index: currDayIdx.current,
        outdoorTemperature: {
          userValue: override ? value : undefined,
        },
      });
    },
    [],
  );

  const updateIndoorTemperature = useCallback((value: number): void => {
    dispatchHistory({
      type: 'updateIndoorTemperature',
      index: currDayIdx.current,
      indoorTemperature: value,
    });
  }, []);

  const updatePricekWh = useCallback((value: number): void => {
    dispatchHistory({
      type: 'updatePricekWh',
      index: currDayIdx.current,
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

  const contextValue = useMemo(
    () => ({
      indoorTemperature: currentCommand.indoorTemperature,
      updateIndoorTemperature,
      outdoorTemperature: currentCommand.outdoorTemperature,
      updateOutdoorTemperature,
      date: new Date(temperatures.current[currDayIdx.current].time),
      duration: simulationDuration,
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
      setPricekWh: updatePricekWh,
      startSimulation,
      pauseSimulation,
    }),
    [
      currentCommand.indoorTemperature,
      currentCommand.outdoorTemperature,
      currentCommand.heatLoss.perComponent,
      currentCommand.heatLoss.global,
      currentCommand.prevTotHeatLoss,
      currentCommand.prevTotPowerCost,
      currentCommand.pricekWh,
      updateIndoorTemperature,
      updateOutdoorTemperature,
      simulationDuration,
      updateSimulationDuration,
      simulationStatus,
      updatePricekWh,
      startSimulation,
      pauseSimulation,
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
