import { FC } from 'react';

import { Stack } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

const Loader: FC = () => (
  <Stack justifyContent="center">
    <CircularProgress />
  </Stack>
);

export default Loader;
