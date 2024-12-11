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
  futur: SimulationCommand[];
  past: NonEmptyArray<SimulationCommand>;
};

const updateCurrentCommand = (
  state: SimulationHistory,
  newValue: Partial<SimulationCommand>,
): SimulationHistory => {
  const { past, futur } = state;
  // always update the current command
  const index = past.length - 1;
  if (index < 0 || index >= past.length) {
    return { past, futur: [] };
  }

  return {
    past: CreateNonEmptyArray(
      updateArrayElement(past, index, past[index].from(newValue)),
    ),
    /**
     * If the new value does not modify the current command, do not delete the future one!
     * This check is necessary, because when a command is applied in the past and the inputs are modified,
     * the changes cause a call to update the current command (the one in the past).
     *
     * Even though the value is identical, if the change is not checked, the future will be deleted.
     */
    futur: past[index].equalsTo(newValue) ? futur : [],
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
    }
  | {
      type: 'updateWindowSize';
      windowSize: WindowSizeType;
    };

export const simulationHistory = (
  state: SimulationHistory,
  action: Action,
): SimulationHistory => {
  if (!state || !state.past.length) {
    throw new Error('The initial state must contain at least one value!');
  }

  const { past, futur } = state;
  const { type } = action;

  switch (type) {
    case 'reset': {
      const { value, userOverride } = past[past.length - 1].outdoorTemperature;
      const { weatherValue } = action.outdoorTemperature;

      return {
        past: [
          past[past.length - 1].from({
            outdoorTemperature: {
              userOverride,
              weatherValue,
              value: userOverride ? value : weatherValue,
            },
            prevTotHeatLoss: 0,
            prevTotPowerCost: 0,
          }),
        ],
        futur: [],
      };
    }
    case 'goToFutur': {
      // TODO: fix or double check, what if we go in futur ouside of futur array? (check schema on ipad)
      if (futur.length) {
        // TODO: explain
        const idx = action.outdoorTemperatures.length;

        return {
          past: CreateNonEmptyArray([...past, ...futur.slice(0, idx)]),
          futur: futur.slice(idx),
        };
      }

      return {
        past: CreateNonEmptyArray(
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
            [...past],
          ),
        ),
        futur,
      };
    }
    case 'goToPast': {
      if (action.idx < 0) {
        throw new Error('The given index is out of range!');
      }

      const lastIdx = action.idx + 1; // + 1 to include the idx

      return {
        past: CreateNonEmptyArray(past.slice(0, lastIdx)),
        futur: [...past.slice(lastIdx), ...futur],
      };
    }
    case 'updateIndoorTemperature':
      return updateCurrentCommand(state, {
        indoorTemperature: action.indoorTemperature,
      });
    case 'updateOutdoorTemperature': {
      // always update the current command
      const index = past.length - 1;
      const { userOverride, value } = action.outdoorTemperature;
      const { weatherValue } = past[index].outdoorTemperature;

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
