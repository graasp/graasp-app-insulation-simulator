import { useEffect, useState } from 'react';

import { Skeleton } from '@mui/material';

export const LoadingComponent = ({
  testId,
  isLoading,
  children,
  firstLoadOnly = false,
}: {
  testId?: string;
  isLoading: boolean;
  children: React.ReactNode;
  firstLoadOnly?: boolean;
}): React.ReactNode => {
  // count number of isLoading to show skeleton on first load if needed.
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setCounter((c) => c + 1);
    }
  }, [isLoading]);

  if (!isLoading || (counter > 1 && firstLoadOnly)) {
    return children;
  }

  return <Skeleton data-testid={testId}>{children}</Skeleton>;
};
