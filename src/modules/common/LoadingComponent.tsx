import { Skeleton } from '@mui/material';

export const LoadingComponent = ({
  testId,
  isLoading,
  children,
}: {
  testId?: string;
  isLoading: boolean;
  children: React.ReactNode;
}): React.ReactNode =>
  isLoading ? <Skeleton data-testid={testId}>{children}</Skeleton> : children;
