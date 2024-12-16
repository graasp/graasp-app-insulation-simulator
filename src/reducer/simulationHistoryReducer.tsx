import equal from 'deep-equal';

import {
  SIMULATION_INDOOR_TEMPERATURE_CELCIUS,
  SIMULATION_OUTDOOR_TEMPERATURE_CELCIUS,
  SIMULATION_PRICE_KWH,
} from '@/config/simulation';
import { HouseComponentsConfigurator } from '@/models/HouseComponentsConfigurator';
import { SimulationHeatLoss } from '@/models/SimulationHeatLoss';
import { TemperatureRow, UserOutdoorTemperature } from '@/types/temperatures';
import { CreateNonEmptyArray, NonEmptyArray } from '@/types/utils';
import { WindowSizeType } from '@/types/window';
import { electricityCost } from '@/utils/electricity';
import { powerConversionFactors } from '@/utils/heatLoss';
import { getOutdoorTemperature } from '@/utils/temperatures';

export type SimulationDay = {
  heatLoss: SimulationHeatLoss;
  totalHeatLoss: number;
  totalElectricityCost: number;
  weatherTemperature: number;
};

type SimulationSettings = {
  indoorTemperature: number;
  outdoorTemperature: UserOutdoorTemperature;
  pricekWh: number;
  numberOfFloors: number;
  houseConfigurator: HouseComponentsConfigurator;
  windowSize: WindowSizeType;
};

type SimulationHistory = {
  currentDayIdx: number;
  simulationDays: NonEmptyArray<SimulationDay>;
  simulationSettings: SimulationSettings;
};

const computeSimulation = (
  state: SimulationHistory,
  newSettings: Partial<SimulationSettings>,
): SimulationHistory => {
  const { currentDayIdx, simulationDays, simulationSettings, ...otherStates } =
    state;
  const { outdoorTemperature, indoorTemperature, houseConfigurator, pricekWh } =
    { ...simulationSettings, ...newSettings };

  // If the new value does not modify the current day, do noting!
  // This check is necessary, because when we navigate through the history and the inputs are modified,
  // the changes cause a call to recompute the whole simulation, even though the value is identical.
  if (equal(simulationDays[currentDayIdx], newSettings)) {
    return state;
  }

  return {
    currentDayIdx,
    ...otherStates,
    simulationSettings: {
      ...simulationSettings,
      ...newSettings,
    },
    simulationDays: CreateNonEmptyArray(
      simulationDays.reduce<SimulationDay[]>((acc, currDay) => {
        const prevDay = acc[acc.length - 1];
        const prevTotHeatLoss =
          prevDay?.totalHeatLoss ?? prevDay?.heatLoss ?? 0;

        const heatLoss = new SimulationHeatLoss({
          indoorTemperature,
          outdoorTemperature: getOutdoorTemperature({
            userTemperature: outdoorTemperature,
            weather: currDay.weatherTemperature,
          }),
          houseConfigurator,
        });

        const totalHeatLoss = prevTotHeatLoss + heatLoss.global;

        return [
          ...acc,
          {
            heatLoss,
            totalHeatLoss,
            totalElectricityCost: electricityCost({
              pricekWh,
              energyConsumptionkWh:
                totalHeatLoss / powerConversionFactors.KiloWatt,
            }),
            weatherTemperature: currDay.weatherTemperature,
          },
        ];
      }, []),
    ),
  };
};

type Action =
  | {
      type: 'load';
      temperatureRows: TemperatureRow[];
    }
  | {
      type: 'restart';
    }
  | {
      type: 'goToDay';
      dayIdx: number;
    }
  | {
      type: 'updateIndoorTemperature';
      indoorTemperature: number;
    }
  | {
      type: 'updateOutdoorTemperature';
      outdoorTemperature: UserOutdoorTemperature;
    }
  | {
      type: 'updateNumberOfFloors';
      numberOfFloors: number;
    }
  | {
      type: 'updatePricekWh';
      pricekWh: number;
    }
  | {
      type: 'updateHouseConfigurator';
      houseConfigurator: HouseComponentsConfigurator;
    }
  | {
      type: 'updateWindowSize';
      windowSize: WindowSizeType;
    };

export const createDefault = (): SimulationHistory => ({
  currentDayIdx: 0,
  simulationDays: CreateNonEmptyArray([
    {
      heatLoss: {} as SimulationHeatLoss,
      totalHeatLoss: 0,
      totalElectricityCost: 0,
      weatherTemperature: 0,
    },
  ]),
  simulationSettings: {
    indoorTemperature: SIMULATION_INDOOR_TEMPERATURE_CELCIUS.DEFAULT,
    outdoorTemperature: {
      userOverride: false,
      value: SIMULATION_OUTDOOR_TEMPERATURE_CELCIUS.DEFAULT,
    },
    pricekWh: SIMULATION_PRICE_KWH,
    numberOfFloors: 1,
    houseConfigurator: HouseComponentsConfigurator.create(), // will be replaced on component register
    windowSize: 'Medium',
  },
});

export const simulationHistory = (
  state: SimulationHistory,
  action: Action,
): SimulationHistory => {
  if (!state || !state.simulationDays.length) {
    throw new Error('The initial state must contain at least one value!');
  }
  const { type } = action;
  const { simulationDays } = state;

  switch (type) {
    case 'load': {
      const numberOfDays = action.temperatureRows.length;
      return computeSimulation(
        {
          ...state,
          simulationDays: CreateNonEmptyArray(
            action.temperatureRows.map(({ temperature }) => ({
              heatLoss: {} as SimulationHeatLoss,
              totalHeatLoss: 0,
              totalElectricityCost: 0,
              weatherTemperature: temperature,
            })),
          ),
          currentDayIdx:
            state.currentDayIdx >= numberOfDays
              ? numberOfDays - 1
              : state.currentDayIdx,
        },
        {},
      );
    }
    case 'restart':
      return { ...state, currentDayIdx: 0 };
    case 'goToDay': {
      const { dayIdx } = action;
      const numberOfDays = simulationDays.length;

      if (dayIdx < 0) {
        console.warn(
          `goToDay: ignoring as dayIdx must be >= 0. Given value was "${dayIdx}".`,
        );

        return { ...state, currentDayIdx: 0 };
      }

      if (dayIdx >= numberOfDays) {
        console.warn(
          `goToDay: ignoring as dayIdx must be < ${numberOfDays}. Given value was "${dayIdx}".`,
        );

        return { ...state, currentDayIdx: numberOfDays - 1 };
      }

      return { ...state, currentDayIdx: dayIdx };
    }
    case 'updateIndoorTemperature':
      return computeSimulation(state, {
        indoorTemperature: action.indoorTemperature,
      });
    case 'updateOutdoorTemperature':
      return computeSimulation(state, {
        outdoorTemperature: action.outdoorTemperature,
      });
    case 'updateNumberOfFloors':
      return computeSimulation(state, {
        numberOfFloors: action.numberOfFloors,
      });
    case 'updatePricekWh':
      return computeSimulation(state, {
        pricekWh: action.pricekWh,
      });
    case 'updateHouseConfigurator':
      return computeSimulation(state, {
        // As React compare the memory adress to
        // dectect changes, we have to clone the configurator
        // to ensure re-render when necessary.
        houseConfigurator: action.houseConfigurator.clone(),
      });
    case 'updateWindowSize':
      return computeSimulation(state, {
        windowSize: action.windowSize,
      });
    default:
      throw new Error(`The given type ${type} is not a valid type.`);
  }
};
