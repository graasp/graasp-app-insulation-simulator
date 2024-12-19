import { Button, Typography } from '@mui/material';

import { useSimulation } from '@/context/SimulationContext';

export const SpeedButton = (): JSX.Element => {
  const { speed } = useSimulation('simulation');

  return (
    <Button
      data-testid={`speed-button-${speed.current}`}
      onClick={() => speed.next()}
      variant="outlined"
    >
      <Typography textTransform="lowercase">{speed.current}</Typography>
    </Button>
  );
};
