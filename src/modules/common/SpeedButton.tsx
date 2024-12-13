import { Button, Typography } from '@mui/material';

import { useSimulation } from '@/context/SimulationContext';

export const SpeedButton = (): JSX.Element => {
  const { speed, nextSpeed } = useSimulation();

  return (
    <Button
      data-testid={`speed-button-${speed}`}
      onClick={() => nextSpeed()}
      variant="outlined"
    >
      <Typography textTransform="lowercase">{speed}</Typography>
    </Button>
  );
};
