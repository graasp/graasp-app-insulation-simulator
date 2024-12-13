import { Flower, Leaf, Snowflake, Sun } from 'lucide-react';

import { useSeason } from '@/context/SeasonContext';
import { useSimulation } from '@/context/SimulationContext';
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
  seasonIcon: JSX.Element;
  formattedWallSize: React.ReactNode;
};

export const useSimulationInformations =
  (): UseSimulationInformationsReturnType => {
    const { season } = useSeason();

    const { heatLoss, houseComponentsConfigurator } = useSimulation();

    const wallComponent = houseComponentsConfigurator.getFirstOfType(
      HouseComponent.Wall,
    );

    return {
      heatLoss: formatHeatLossRate(heatLoss),
      seasonIcon: iconsBySeason[season],
      formattedWallSize: wallComponent
        ? formatComponentSize({
            componentSize: wallComponent.size,
          })
        : '-',
    };
  };
