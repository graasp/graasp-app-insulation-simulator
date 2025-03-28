import { ReactNode, createContext, useContext, useMemo } from 'react';

import { Season, Seasons } from '@/types/seasons';
import { getSeason } from '@/utils/seasons';

import { useSimulation } from './SimulationContext';

type SeasonContextType = {
  season: Season;
};

const SeasonContext = createContext<SeasonContextType>({
  season: Seasons.Spring,
});

type Props = {
  children: ReactNode;
};

export const SeasonProvider = ({ children }: Props): ReactNode => {
  const { date } = useSimulation('simulation');
  const season = getSeason(date);

  const contextValue = useMemo(
    () => ({
      season,
    }),
    [season],
  );

  return (
    <SeasonContext.Provider value={contextValue}>
      {children}
    </SeasonContext.Provider>
  );
};

export const useSeason = (): SeasonContextType =>
  useContext<SeasonContextType>(SeasonContext);
