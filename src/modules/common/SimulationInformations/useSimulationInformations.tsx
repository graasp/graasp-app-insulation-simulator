import { useMemo } from 'react';

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
  wallsPrice: number;
  seasonIcon: JSX.Element;
  formattedWallSize: React.ReactNode;
};

export const useSimulationInformations =
  (): UseSimulationInformationsReturnType => {
    const { season } = useSeason();

    const {
      heatLoss: { global: heatLoss },
      house: { getByType, getFirstOfType },
    } = useSimulation();

    const wallComponent = useMemo(
      () => getFirstOfType(HouseComponent.Wall),
      [getFirstOfType],
    );

    const wallPrices = useMemo(
      () =>
        getByType(HouseComponent.Wall).reduce(
          (totCost, houseComponent) =>
            totCost +
            houseComponent.actualArea *
              houseComponent.buildingMaterials.reduce(
                (componentCost, material) =>
                  componentCost + material.price * material.thickness,
                0,
              ),
          0,
        ),
      [getByType],
    );

    return {
      heatLoss: formatHeatLossRate(heatLoss),
      wallsPrice: Math.round(wallPrices),
      seasonIcon: iconsBySeason[season],
      formattedWallSize: wallComponent
        ? formatComponentSize({
            componentSize: wallComponent.size,
          })
        : '-',
    };
  };
