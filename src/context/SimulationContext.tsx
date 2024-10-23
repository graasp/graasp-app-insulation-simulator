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

import { useTemperature } from '@/context/TemperatureContext';
import { FormattedHeatLoss } from '@/types/heatLoss';
import {
  calculateElectricityCost,
  calculateHeatLossConstantFactor,
  formatHeatLossRate,
  sumHeatLossRate,
} from '@/utils/heatLoss';

export enum SimulationStatus {
  IDLE,
  RUNNING,
  FINISHED,
}

const SIMULATION_ERROR_CONTEXT =
  'The Simulation context is being used, but the corresponding provider is not found. Please ensure that the provider is defined and properly wrapped around the component.';

// TODO: move?
const SIMULATION_FRAME_MS = 150;

type Material = {
  price: number;
  thermalConductivity: number;
  thickness: number;
};

type SimulationContextType = {
  status: SimulationStatus;
  heatLoss: FormattedHeatLoss;
  totalHeatLoss: FormattedHeatLoss;
  electricityCost: number;
  indoorTemperature: number;
  material: Material;
  start: () => void;
};

const SimulationContext = createContext<SimulationContextType>({
  status: SimulationStatus.IDLE,
  heatLoss: { value: 0, unit: 'W' },
  totalHeatLoss: { value: 0, unit: 'W' },
  electricityCost: 0,
  indoorTemperature: 0,
  material: { price: 0, thermalConductivity: 0, thickness: 0 },
  start: () => {
    throw new Error(SIMULATION_ERROR_CONTEXT);
  },
});

type Props = {
  children: ReactNode;
};

export const SimulationProvider = ({ children }: Props): ReactNode => {
  // TODO: These parameters will be changed by the user
  const indoorTemperature = 22;
  const area = 100;
  const material: Material = useMemo(
    () => ({
      price: 0,
      thermalConductivity: 0.021,
      thickness: 0.25,
    }),
    [],
  );
  const pricekWh = 0.22;

  const [simulationStatus, setSimulationStatus] = useState<SimulationStatus>(
    SimulationStatus.IDLE,
  );
  const {
    temperatures,
    meanTemperature,
    hasMoreTemperature,
    nextTemperature,
    reset,
  } = useTemperature();

  const [totalHeatLoss, setTotalHeatLoss] = useState(0);

  const intervalId = useRef<{
    id: NodeJS.Timeout | string | number | undefined;
  }>({ id: undefined });

  const start = useCallback((): void => {
    if (simulationStatus === SimulationStatus.RUNNING) {
      return;
    }

    setSimulationStatus(SimulationStatus.RUNNING);
    setTotalHeatLoss(0);
    reset();

    intervalId.current.id = setInterval(() => {
      if (hasMoreTemperature()) {
        nextTemperature();
      } else {
        clearInterval(intervalId.current.id);
        setSimulationStatus(SimulationStatus.FINISHED);
      }
    }, SIMULATION_FRAME_MS);
  }, [hasMoreTemperature, nextTemperature, reset, simulationStatus]);

  const heatLossConstantFactor = useMemo(
    () =>
      calculateHeatLossConstantFactor({
        area,
        thermalConductivity: material.thermalConductivity,
        materialThickness: material.thickness,
      }),
    [area, material.thermalConductivity, material.thickness],
  );

  const heatLoss = sumHeatLossRate({
    temperatures,
    constantFactor: heatLossConstantFactor,
    indoorTemperature,
  });

  useEffect(() => {
    setTotalHeatLoss((prevT) => prevT + heatLoss);
  }, [heatLoss, heatLossConstantFactor, temperatures]);

  const contextValue = useMemo(
    () => ({
      indoorTemperature,
      outdoorTemperature: meanTemperature,
      material,
      status: simulationStatus,
      heatLoss: formatHeatLossRate(heatLoss),
      totalHeatLoss: formatHeatLossRate(totalHeatLoss),
      electricityCost: calculateElectricityCost(
        pricekWh,
        formatHeatLossRate(totalHeatLoss),
      ),
      start,
    }),
    [
      heatLoss,
      material,
      meanTemperature,
      simulationStatus,
      start,
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
