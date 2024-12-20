import { useState } from 'react';

import { TabContext, TabList } from '@mui/lab';
import { Stack, Tab } from '@mui/material';

import { TabPanel } from './TabPanel';

export type DataTab = {
  label: string;
  icon?: JSX.Element;
  unmountOnExit?: boolean;
  element: JSX.Element;
};

type Props = {
  height: string | number;
  width: string | number;
  tabs: DataTab[];
};

export const Tabs = ({ height, width, tabs }: Props): JSX.Element => {
  const [tab, setTab] = useState('0');

  return (
    <Stack>
      <TabContext value={tab}>
        <Stack sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={(_, v) => setTab(v)}>
            {tabs.map(({ icon, label }, idx) => (
              <Tab
                key={label}
                icon={icon}
                iconPosition="start"
                label={label}
                value={idx.toString()}
              />
            ))}
          </TabList>
        </Stack>
        <Stack position="relative" height={height} width={width}>
          {tabs.map(({ element, label, unmountOnExit }, idx) => (
            <TabPanel
              key={label}
              value={idx.toString()}
              unmountOnExit={unmountOnExit}
            >
              {element}
            </TabPanel>
          ))}
        </Stack>
      </TabContext>
    </Stack>
  );
};
