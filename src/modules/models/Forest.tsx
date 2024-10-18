import { GroupProps } from '@react-three/fiber';

import { FirTree } from './FirTree/FirTree';

type Props = GroupProps;

export const Forest = (props: Props): JSX.Element => (
  <group {...props}>
    <FirTree position={[0, 0, 0]} />
    <FirTree position={[0.6, 0, 1.2]} />
    <FirTree position={[-0.5, 0, -0.5]} />
    <FirTree position={[0.6, 0, -0.8]} />
  </group>
);
