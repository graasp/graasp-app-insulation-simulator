import { useEffect, useState } from 'react';

import { useTabContext } from '@mui/lab';

type Props = {
  children: JSX.Element;
  value: string;
  unmountOnExit?: boolean;
};

/**
 * This component allow to sue the MUI Tabs without the conditional rendering.
 *
 * Original code source: https://github.com/mui/material-ui/issues/21250.
 * @param unmountOnExit indicates if the children must be unmount on tab changed.
 */
export const TabPanel = ({
  children,
  value: id,
  unmountOnExit = false,
}: Props): JSX.Element | null => {
  const context = useTabContext();

  if (context === null) {
    throw new TypeError('No TabContext provided');
  }
  const tabId = context.value;
  const isCurrent = id === tabId;

  const [visited, setVisited] = useState(false);
  useEffect(() => {
    if (isCurrent) {
      setVisited(true);
    }
  }, [isCurrent]);

  return (unmountOnExit && isCurrent) || !unmountOnExit ? (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        margin: 'auto',
        visibility: isCurrent ? 'visible' : 'hidden',
      }}
    >
      {visited && children}
    </div>
  ) : null;
};
