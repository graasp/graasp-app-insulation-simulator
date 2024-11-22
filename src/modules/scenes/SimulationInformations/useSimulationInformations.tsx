import { Flower, Leaf, Snowflake, Sun } from 'lucide-react';

import { useSeason } from '@/context/SeasonContext';
import { useSimulation } from '@/context/SimulationContext';
import { FormattedHeatLoss } from '@/types/heatLoss';
import { Season, Seasons } from '@/types/seasons';
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
  seasonIcon: JSX.Element;
};

export const useSimulationInformations =
  (): UseSimulationInformationsReturnType => {
    const { season } = useSeason();

    const { heatLosses } = useSimulation();

    const heatLoss = formatHeatLossRate(
      Object.values(heatLosses).reduce((acc, heat) => acc + heat, 0),
    );

    return {
      heatLoss,
      seasonIcon: iconsBySeason[season],
    };
  };
