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
import { SimulationCommand } from '@/models/SimulationCommand';
import { FormattedHeatLoss } from '@/types/heatLoss';
import { HeatLossPerComponent } from '@/types/houseComponent';
import { SimulationStatus } from '@/types/simulation';
import { TemperatureRow } from '@/types/temperatures';
import { FormattedTime, TimeUnit } from '@/types/time';
import { undefinedContextErrorFactory } from '@/utils/context';
import { electricityCost } from '@/utils/electricity';
import { formatHeatLossRate, powerConversionFactors } from '@/utils/heatLoss';
import { loadTemperaturesFromCSV } from '@/utils/temperatures';
import { formatHours, timeConversionFactors } from '@/utils/time';

import { useHouseComponents } from './HouseComponentsContext';

type OutdoorTemperature = { override: boolean; value: number };

type SimulationContextType = {
  status: SimulationStatus;
  heatLossPerComponent: HeatLossPerComponent;
  totalHeatLoss: FormattedHeatLoss;
  electricityCost: number;
  setPricekWh: (newPrice: number) => void;
  indoorTemperature: number;
  updateIndoorTemperature: (newTemperature: number) => void;
  outdoorTemperature: OutdoorTemperature;
  updateOutdoorTemperature: (props: OutdoorTemperature) => void;
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
  const temperatures = useRef<TemperatureRow[]>([
    {
      time: new Date().toLocaleString(),
      temperature: Number.NaN,
    },
  ]);

  const [simulationDuration, setSimulationDuration] = useState<FormattedTime>({
    value: 1,
    unit: TimeUnit.Years,
  });

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

  const currDayIdx = useRef(0);

  const [history, setHistory] = useState<SimulationCommand[]>([]); // TODO: check if state is ok

  const [simulationStatus, setSimulationStatus] = useState<SimulationStatus>(
    SimulationStatus.LOADING, // waiting for the temperatures...
  );

  const [indoorTemperature, setIndoorTemperature] = useState(
    SIMULATION_INDOOR_TEMPERATURE_CELCIUS.DEFAULT,
  );

  const [userOutdoorTemperature, setUserOutdoorTemperature] = useState({
    override: false,
    value: SIMULATION_OUTDOOR_TEMPERATURE_CELCIUS.DEFAULT,
  });

  const [pricekWh, setPricekWh] = useState(SIMULATION_PRICE_KWH);

  const { time: currentDay, temperature: currentOutdoorTemperature } =
    temperatures.current[currDayIdx.current];

  const outdoorTemperature = userOutdoorTemperature.override
    ? userOutdoorTemperature.value
    : currentOutdoorTemperature;

  const { houseComponentsConfigurator, numberOfFloors } = useHouseComponents();

  const { heatLossPerComponent, heatLoss } = useHeatLoss({
    houseComponentsConfigurator,
    indoorTemperature,
    measurementFrequency: TimeUnit.Days, // TODO: to adapt or always set per day?
    temperatures: [outdoorTemperature],
  });

  // TODO: maybe we should only use one state => the command?
  const { totalHeatLoss } = history[currDayIdx.current] || {};
  const { totalElectricityCost } = history[currDayIdx.current] || {};

  const simulationIntervalId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadTemperaturesFromCSV(csv.path).then((rows) => {
      // TODO: to simplify? One temperature per day!
      temperatures.current = rows;
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

    if (temperatures.current.length === 0) {
      throw new Error('The temperatures are not loaded!');
    }

    if (simulationStatus !== SimulationStatus.PAUSED) {
      // reset simulation on restart!
      currDayIdx.current = 0;
      setHistory([]);
    }

    setSimulationStatus(SimulationStatus.RUNNING);

    simulationIntervalId.current = setInterval(() => {
      if (currDayIdx.current + 1 < numberOfRows) {
        setHistory((curr) => {
          const prev = curr[curr.length - 1];
          const prevTotaHeatLoss = prev?.totalHeatLoss ?? 0;
          const prevTotElectricityCost = prev?.totalElectricityCost ?? 0;

          return [
            ...curr,
            new SimulationCommand({
              indoorTemperature,
              outdoorTemperature,
              numberOfFloors,
              powerCost: pricekWh,
              heatLoss,
              totalHeatLoss: prevTotaHeatLoss + heatLoss,
              totalElectricityCost:
                prevTotElectricityCost +
                electricityCost({
                  pricekWh,
                  energyConsumptionkWh:
                    (prevTotaHeatLoss + heatLoss) /
                    powerConversionFactors.KiloWatt,
                }),
              houseConfigurator: houseComponentsConfigurator,
            }),
          ];
        });

        currDayIdx.current += 1;
      } else if (simulationIntervalId.current) {
        clearInterval(simulationIntervalId.current);
        setSimulationStatus(SimulationStatus.FINISHED);
      }
    }, simulationFrameMS); // TODO: use from constructor!
  }, [
    heatLoss,
    houseComponentsConfigurator,
    indoorTemperature,
    numberOfFloors,
    numberOfRows,
    outdoorTemperature,
    pricekWh,
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

  const updateOutdoorTemperature = ({
    override,
    value,
  }: {
    override: boolean;
    value: number;
  }): void => {
    setUserOutdoorTemperature({ override, value });
  };

  const contextValue = useMemo(
    () => ({
      indoorTemperature,
      updateIndoorTemperature: setIndoorTemperature,
      outdoorTemperature: {
        override: userOutdoorTemperature.override,
        value: outdoorTemperature,
      },
      updateOutdoorTemperature,
      date: new Date(currentDay),
      duration: simulationDuration,
      updateSimulationDuration: (
        duration: Pick<FormattedTime, 'value'> & {
          unit: typeof TimeUnit.Years;
        },
      ) => setSimulationDuration(duration),
      status: simulationStatus,
      heatLossPerComponent,
      totalHeatLoss: formatHeatLossRate(totalHeatLoss),
      electricityCost: totalElectricityCost,
      setPricekWh,
      startSimulation,
      pauseSimulation,
    }),
    [
      currentDay,
      heatLossPerComponent,
      indoorTemperature,
      outdoorTemperature,
      pauseSimulation,
      simulationDuration,
      simulationStatus,
      startSimulation,
      totalElectricityCost,
      totalHeatLoss,
      userOutdoorTemperature.override,
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
