import { RoundedBox } from '@react-three/drei';
import { Vector3 } from '@react-three/fiber';

import { useSeason } from '@/context/SeasonContext';
import { Seasons } from '@/types/seasons';

const COLORS_BY_SEASON = {
  [Seasons.Winter]: '#D0D4D8',
  [Seasons.Spring]: '#76B041',
  [Seasons.Summer]: '#52b041',
  [Seasons.Autumn]: '#94b041',
};

const SIZE_IN_METERS = 16;
const HEIGHT_IN_METERS = 0.8;

type Props = {
  position: Vector3;
};

export const Garden = ({ position }: Props): JSX.Element => {
  const { season } = useSeason();

  return (
    <RoundedBox
      scale={[SIZE_IN_METERS, HEIGHT_IN_METERS, SIZE_IN_METERS]}
      position={position}
    >
      <meshStandardMaterial color={COLORS_BY_SEASON[season]} />
    </RoundedBox>
  );
};
