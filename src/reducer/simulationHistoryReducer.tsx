import { SIMULATION_PRICE_KWH } from '@/config/simulation';
import { HouseComponentsConfigurator } from '@/models/HouseComponentsConfigurator';
import { SimulationCommand } from '@/models/SimulationCommand';
import { OutdoorTemperature } from '@/types/temperatures';
import { updateArrayElement } from '@/types/utils';
import { electricityCost } from '@/utils/electricity';
import { powerConversionFactors } from '@/utils/heatLoss';

const updateState = (
  state: SimulationCommand[],
  index: number,
  value: Partial<SimulationCommand>,
): SimulationCommand[] => {
  if (index < 0 || index >= state.length) {
    return state;
  }

  // TODO: should we directly invalidate the futur?
  return updateArrayElement(state, index, state[index].from(value));
};

type Action =
  | {
      type: 'reset';
      outdoorTemperature: Pick<OutdoorTemperature, 'weatherValue'>;
    }
  | {
      type: 'add';
      command: SimulationCommand;
    }
  | {
      type: 'updateIndoorTemperature';
      index: number;
      indoorTemperature: number;
    }
  | {
      type: 'updateOutdoorTemperature';
      index: number;
      outdoorTemperature: Omit<OutdoorTemperature, 'weatherValue'>;
    }
  | {
      type: 'updateNumberOfFloors';
      index: number;
      numberOfFloors: number;
    }
  | {
      type: 'updatePricekWh';
      index: number;
      pricekWh: number;
    }
  | {
      type: 'updateHouseConfigurator';
      index: number;
      houseConfigurator: HouseComponentsConfigurator;
    };

export const simulationHistory = (
  state: SimulationCommand[],
  action: Action,
): SimulationCommand[] => {
  const { type } = action;

  switch (type) {
    case 'reset': {
      if (state.length) {
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
      return [];
    }
    case 'add': {
      const prev = state[state.length - 1];
      // Calculate the cumulative heat loss.  If this is the first element
      // (prev is undefined), the total is 0. Otherwise, add the current
      // element's heat loss to the accumulated heat loss from previous elements.
      const prevTotHeatLoss =
        (prev?.prevTotHeatLoss ?? 0) + (prev?.heatLoss.global ?? 0);

      const prevTotPowerCost = electricityCost({
        pricekWh: prev?.pricekWh ?? SIMULATION_PRICE_KWH,
        energyConsumptionkWh: prevTotHeatLoss / powerConversionFactors.KiloWatt,
      });

      return [
        ...state,
        action.command.from({ prevTotHeatLoss, prevTotPowerCost }),
      ];
    }
    case 'updateIndoorTemperature':
      return updateState(state, action.index, {
        indoorTemperature: action.indoorTemperature,
      });
    case 'updateOutdoorTemperature': {
      const { userOverride, value } = action.outdoorTemperature;
      const { weatherValue } = state[action.index].outdoorTemperature;

      return updateState(state, action.index, {
        outdoorTemperature: {
          userOverride,
          weatherValue,
          value: userOverride ? value : weatherValue,
        },
      });
    }
    case 'updateNumberOfFloors':
      return updateState(state, action.index, {
        numberOfFloors: action.numberOfFloors,
      });
    case 'updatePricekWh':
      return updateState(state, action.index, { pricekWh: action.pricekWh });
    case 'updateHouseConfigurator':
      return updateState(state, action.index, {
        houseConfigurator: action.houseConfigurator,
      });
    default:
      throw new Error(`The given type ${type} is not a valid type.`);
  }
};
