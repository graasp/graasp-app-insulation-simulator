import { Text3D } from '@react-three/drei';
import { Color, MeshStandardMaterial } from 'three';

import { FormattedHeatLoss, HeatLossSymbol } from '@/types/heatLoss';

const SIZE = 0.4;
const FONT = 'RobotoRegular.json';
const LETTER_SPACING = -0.025;
const Y_OFFSET = -0.2;

type Props = {
  heatLoss: FormattedHeatLoss;
  color: Color | string;
};

export const HeatLossTextArrow = ({ heatLoss, color }: Props): JSX.Element => {
  const material = new MeshStandardMaterial({ color });
  const heatLossToString = `${heatLoss.value} ${HeatLossSymbol[heatLoss.unit]}`;

  return (
    <>
      <Text3D
        font={FONT}
        position={[-0.7, Y_OFFSET, 0]}
        rotation={[0, 2 * Math.PI, 0]}
        material={material}
        letterSpacing={LETTER_SPACING}
        size={SIZE}
      >
        {heatLossToString}
      </Text3D>
      <Text3D
        font={FONT}
        position={[1.1, Y_OFFSET, 0]}
        rotation={[0, Math.PI, 0]}
        material={material}
        letterSpacing={LETTER_SPACING}
        size={SIZE}
      >
        {heatLossToString}
      </Text3D>
    </>
  );
};
