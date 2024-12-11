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
  history: NonEmptyArray<SimulationCommand>;
};

const updateCurrentCommand = (
  state: SimulationHistory,
  newValue: Partial<SimulationCommand>,
): SimulationHistory => {
  const { history, futur } = state;
  // always update the current command
  const index = history.length - 1;
  if (index < 0 || index >= history.length) {
    return { history, futur: [] };
  }

  return {
    history: CreateNonEmptyArray(
      updateArrayElement(history, index, history[index].from(newValue)),
    ),
    /**
     * If the new value does not modify the current command, do not delete the future one!
     * This check is necessary, because when a command is applied in the history and the inputs are modified,
     * the changes cause a call to update the current command (the one in the history).
     *
     * Even though the value is identical, if the change is not checked, the future will be deleted.
     */
    futur: history[index].equalsTo(newValue) ? futur : [],
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
  if (!state || !state.history.length) {
    throw new Error('The initial state must contain at least one value!');
  }

  const { history, futur } = state;
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
        futur: [],
      };
    }
    case 'goToFutur': {
      // TODO: explain
      const numberOfCommands = action.outdoorTemperatures.length;

      // the futur destination has already been visited (exist in futur array)
      if (numberOfCommands - 1 < futur.length) {
        return {
          history: CreateNonEmptyArray([
            ...history,
            ...futur.slice(0, numberOfCommands),
          ]),
          futur: futur.slice(numberOfCommands),
        };
      }

      // const neverVisitedFutur = action.outdoorTemperatures.slice()

      switch (true) {
        // no futur, we have to create it using the past
        case futur.length === 0:
          return {
            history: CreateNonEmptyArray(
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
                [...history],
              ),
            ),
            futur,
          };
        // the futur destination has been visited partially
        // but a part must be created (partial futur present in futur array)
        case numberOfCommands >= futur.length:
          return {
            history: CreateNonEmptyArray(
              action.outdoorTemperatures
                .slice(futur.length)
                .reduce<SimulationCommand[]>(
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
                  [...history, ...futur.slice(0, futur.length)],
                ),
            ),
            futur: [],
          };
        default:
          console.error('This case was not handled!');
          return state;
      }
    }
    case 'goToPast': {
      if (action.idx < 0) {
        throw new Error('The given index is out of range!');
      }

      const lastIdx = action.idx + 1; // + 1 to include the idx

      return {
        history: CreateNonEmptyArray(history.slice(0, lastIdx)),
        futur: [...history.slice(lastIdx), ...futur],
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
