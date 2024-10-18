import { PLAYER_VIEW_CY } from '@/config/selectors';

import FirstScene from '../scenes/FirstScene';

const PlayerView = (): JSX.Element => (
  <div data-cy={PLAYER_VIEW_CY}>
    <FirstScene />
  </div>
);

export default PlayerView;
