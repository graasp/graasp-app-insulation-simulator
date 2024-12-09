import { SIMULATION_PRICE_KWH } from '@/config/simulation';
import { HouseComponentsConfigurator } from '@/models/HouseComponentsConfigurator';
import { SimulationCommand } from '@/models/SimulationCommand';
import { OutdoorTemperature } from '@/types/temperatures';
import {
  CreateNonEmptyArray,
  NonEmptyArray,
  updateArrayElement,
} from '@/types/utils';
import { electricityCost } from '@/utils/electricity';
import { powerConversionFactors } from '@/utils/heatLoss';

const updateState = (
  state: NonEmptyArray<SimulationCommand>,
  index: number,
  value: Partial<SimulationCommand>,
): NonEmptyArray<SimulationCommand> => {
  if (index < 0 || index >= state.length) {
    return state;
  }

  return CreateNonEmptyArray(
    updateArrayElement(state, index, state[index].from(value)),
  );
};

const computePrevTot = (
  prev: SimulationCommand,
): {
  prevTotHeatLoss: number;
  prevTotPowerCost: number;
} => {
  // Calculate the cumulative heat loss.  If this is the first element
  // (prev is undefined), the total is 0. Otherwise, add the current
  // element's heat loss to the accumulated heat loss from previous elements.
  const prevTotHeatLoss =
    (prev.prevTotHeatLoss ?? 0) + (prev.heatLoss.global ?? 0);

  const prevTotPowerCost =
    (prev.prevTotPowerCost ?? 0) +
    electricityCost({
      pricekWh: prev.pricekWh ?? SIMULATION_PRICE_KWH,
      energyConsumptionkWh:
        (prev.heatLoss.global ?? 0) / powerConversionFactors.KiloWatt,
    });

  return {
    prevTotHeatLoss,
    prevTotPowerCost,
  };
};

type Action =
  | {
      type: 'reset';
      outdoorTemperature: Pick<OutdoorTemperature, 'weatherValue'>;
    }
  | {
      type: 'add';
      command: Partial<SimulationCommand>;
    }
  | {
      type: 'goToFutur';
      outdoorTemperatures: SimulationCommand['outdoorTemperature'][];
    }
  | {
      type: 'goToPast';
      idx: number;
    }
  | {
      type: 'updateIndoorTemperature';
      indoorTemperature: number;
    }
  | {
      type: 'updateOutdoorTemperature';
      outdoorTemperature: Omit<OutdoorTemperature, 'weatherValue'>;
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
    };

export const simulationHistory = (
  state: NonEmptyArray<SimulationCommand>,
  action: Action,
): NonEmptyArray<SimulationCommand> => {
  if (!state.length) {
    throw new Error('The initial state must contain at least one value!');
  }

  const { type } = action;

  switch (type) {
    case 'reset': {
      const { value, userOverride } =
        state[state.length - 1].outdoorTemperature;
      const { weatherValue } = action.outdoorTemperature;

      return [
        state[state.length - 1].from({
          outdoorTemperature: {
            userOverride,
            weatherValue,
            value: userOverride ? value : weatherValue,
          },
          prevTotHeatLoss: 0,
          prevTotPowerCost: 0,
        }),
      ];
    }
    case 'add': {
      const prev = state[state.length - 1];

      return [
        ...state,
        prev.from({
          ...action.command,
          ...computePrevTot(prev),
        }),
      ];
    }
    case 'goToFutur': {
      return CreateNonEmptyArray(
        action.outdoorTemperatures.reduce<SimulationCommand[]>(
          (acc, currOutdoor) => {
            const prev = acc[acc.length - 1];

            return [
              ...acc,
              prev.from({
                ...computePrevTot(prev),
                outdoorTemperature: currOutdoor,
              }),
            ];
          },
          [...state],
        ),
      );
    }
    case 'goToPast': {
      if (action.idx < 0) {
        throw new Error('The given index is out of range!');
      }

      return CreateNonEmptyArray(state.slice(0, action.idx + 1));
    }
    case 'updateIndoorTemperature':
      // always update the current command
      return updateState(state, state.length - 1, {
        indoorTemperature: action.indoorTemperature,
      });
    case 'updateOutdoorTemperature': {
      // always update the current command
      const index = state.length - 1;
      const { userOverride, value } = action.outdoorTemperature;
      const { weatherValue } = state[index].outdoorTemperature;

      return updateState(state, index, {
        outdoorTemperature: {
          userOverride,
          weatherValue,
          value: userOverride ? value : weatherValue,
        },
      });
    }
    case 'updateNumberOfFloors':
      // always update the current command
      return updateState(state, state.length - 1, {
        numberOfFloors: action.numberOfFloors,
      });
    case 'updatePricekWh':
      // always update the current command
      return updateState(state, state.length - 1, {
        pricekWh: action.pricekWh,
      });
    case 'updateHouseConfigurator':
      // always update the current command
      return updateState(state, state.length - 1, {
        houseConfigurator: action.houseConfigurator,
      });
    default:
      throw new Error(`The given type ${type} is not a valid type.`);
  }
};
