import { useMemo } from 'react';

import { Flower, Leaf, Snowflake, Sun } from 'lucide-react';

import { useSeason } from '@/context/SeasonContext';
import { useSimulation } from '@/context/SimulationContext';
import { useHouseCost } from '@/hooks/useHouseCost';
import { FormattedHeatLoss } from '@/types/heatLoss';
import { HouseComponent } from '@/types/houseComponent';
import { Season, Seasons } from '@/types/seasons';
import { formatComponentSize } from '@/utils/formatComponentSize';
import { formatHeatLossRate } from '@/utils/heatLoss';

type IconBySeasonType = { [s in Season]: JSX.Element };

const iconsBySeason: IconBySeasonType = {
  [Seasons.Winter]: <Snowflake />,
  [Seasons.Spring]: <Flower />,
  [Seasons.Summer]: <Sun />,
  [Seasons.Autumn]: <Leaf />,
};

type UseSimulationInformationsReturnType = {
  heatLoss: FormattedHeatLoss;
  wallsPrice: number;
  seasonIcon: JSX.Element;
  formattedWallSize: React.ReactNode;
};

export const useSimulationInformations =
  (): UseSimulationInformationsReturnType => {
    const { season } = useSeason();

    const {
      heatLoss: { global: heatLoss },
      house: { getFirstOfType },
    } = useSimulation();

    const wallComponent = useMemo(
      () => getFirstOfType(HouseComponent.Wall),
      [getFirstOfType],
    );

    const { wallCost } = useHouseCost();

    return {
      heatLoss: formatHeatLossRate(heatLoss),
      wallsPrice: Math.round(wallCost),
      seasonIcon: iconsBySeason[season],
      formattedWallSize: wallComponent
        ? formatComponentSize({
            componentSize: wallComponent.size,
          })
        : '-',
    };
  };
