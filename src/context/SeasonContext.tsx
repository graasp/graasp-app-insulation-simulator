import { ReactNode, createContext, useContext, useMemo } from 'react';

import { AllSeasons, Season, Seasons } from '@/types/seasons';

import { useTemperature } from './TemperatureContext';

type SeasonContextType = {
  season: Season;
};

const SeasonContext = createContext<SeasonContextType>({
  season: Seasons.Spring,
});

type Props = {
  children: ReactNode;
};

const getSeason = (date: Date): number =>
  Math.floor((date.getMonth() / 12) * 4) % 4;

export const SeasonProvider = ({ children }: Props): ReactNode => {
  const { period } = useTemperature();
  const season = AllSeasons[getSeason(period.from)];

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
