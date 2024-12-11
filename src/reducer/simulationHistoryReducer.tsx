import { SIMULATION_PRICE_KWH } from '@/config/simulation';
import { HouseComponentsConfigurator } from '@/models/HouseComponentsConfigurator';
import { SimulationCommand } from '@/models/SimulationCommand';
import { OutdoorTemperature } from '@/types/temperatures';
import {
  CreateNonEmptyArray,
  NonEmptyArray,
  updateArrayElement,
} from '@/types/utils';
import { WindowSizeType } from '@/types/window';
import { electricityCost } from '@/utils/electricity';
import { powerConversionFactors } from '@/utils/heatLoss';

type SimulationHistory = {
  future: SimulationCommand[];
  history: NonEmptyArray<SimulationCommand>;
};

const updateCurrentCommand = (
  state: SimulationHistory,
  newValue: Partial<SimulationCommand>,
): SimulationHistory => {
  const { history, future } = state;
  // always update the current command
  const index = history.length - 1;
  if (index < 0 || index >= history.length) {
    return { history, future: [] };
  }

  return {
    history: CreateNonEmptyArray(
      updateArrayElement(history, index, history[index].from(newValue)),
    ),
    // If the new value does not modify the current command, do not delete the future one!
    // This check is necessary, because when a command is applied in the history and the inputs are modified,
    // the changes cause a call to update the current command (the one in the history).
    // Even though the value is identical, if the change is not checked, the future will be deleted.
    future: history[index].equalsTo(newValue) ? future : [],
  };
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
      type: 'goToFuture';
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
    }
  | {
      type: 'updateWindowSize';
      windowSize: WindowSizeType;
    };

export const simulationHistory = (
  state: SimulationHistory,
  action: Action,
): SimulationHistory => {
  if (!state || !state.history.length) {
    throw new Error('The initial state must contain at least one value!');
  }

  const { history, future } = state;
  const { type } = action;

  switch (type) {
    case 'reset': {
      const { value, userOverride } =
        history[history.length - 1].outdoorTemperature;
      const { weatherValue } = action.outdoorTemperature;

      return {
        history: [
          history[history.length - 1].from({
            outdoorTemperature: {
              userOverride,
              weatherValue,
              value: userOverride ? value : weatherValue,
            },
            prevTotHeatLoss: 0,
            prevTotPowerCost: 0,
          }),
        ],
        future: [],
      };
    }
    case 'goToFuture': {
      // The length of outdoorTemperatures represents the number of days to move forward,
      // as each temperature corresponds to a new day.
      const numberOfDays = action.outdoorTemperatures.length;

      // If the target day is already within the existing future,
      // move the corresponding commands from future to history.
      if (numberOfDays <= future.length) {
        return {
          history: CreateNonEmptyArray([
            ...history,
            ...future.slice(0, numberOfDays),
          ]),
          future: future.slice(numberOfDays),
        };
      }

      // Otherwise, the target day extends beyond the current future (or future is empty).
      // Calculate the unvisited portion of the future based on the provided temperatures.
      // Example: history = [0, 1, 2], future = [3, 4], outdoorTemperatures = [3, 4, 5, 6]
      // The code will simulate and add days 5 and 6 to the history.
      const unvisitedFutur = action.outdoorTemperatures.slice(future.length);
      const alreadyVisitedDays = [...history, ...future]; // no need to recompute these values

      return {
        history: CreateNonEmptyArray(
          unvisitedFutur.reduce((acc, currOutdoor) => {
            const prev = acc[acc.length - 1];

            return [
              ...acc,
              prev.from({
                ...computePrevTot(prev),
                outdoorTemperature: currOutdoor,
              }),
            ];
          }, alreadyVisitedDays),
        ),
        future: [], // Clear the future since it has been fully incorporated into history
      };
    }
    case 'goToPast': {
      if (action.idx < 0) {
        throw new Error('The given index is out of range!');
      }

      const lastIdx = action.idx + 1; // + 1 to include the idx

      return {
        history: CreateNonEmptyArray(history.slice(0, lastIdx)),
        future: [...history.slice(lastIdx), ...future],
      };
    }
    case 'updateIndoorTemperature':
      return updateCurrentCommand(state, {
        indoorTemperature: action.indoorTemperature,
      });
    case 'updateOutdoorTemperature': {
      // always update the current command
      const index = history.length - 1;
      const { userOverride, value } = action.outdoorTemperature;
      const { weatherValue } = history[index].outdoorTemperature;

      return updateCurrentCommand(state, {
        outdoorTemperature: {
          userOverride,
          weatherValue,
          value: userOverride ? value : weatherValue,
        },
      });
    }
    case 'updateNumberOfFloors':
      return updateCurrentCommand(state, {
        numberOfFloors: action.numberOfFloors,
      });
    case 'updatePricekWh':
      return updateCurrentCommand(state, {
        pricekWh: action.pricekWh,
      });
    case 'updateHouseConfigurator':
      return updateCurrentCommand(state, {
        houseConfigurator: action.houseConfigurator,
      });
    case 'updateWindowSize':
      return updateCurrentCommand(state, {
        windowSize: action.windowSize,
      });
    default:
      throw new Error(`The given type ${type} is not a valid type.`);
  }
};
