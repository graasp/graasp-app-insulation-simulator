import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { AllSeasons, Season, Seasons } from '@/types/seasons';

type SeasonContextType = {
  season: Season;
  nextSeason: () => void;
};

const SeasonContext = createContext<SeasonContextType>({
  season: Seasons.Spring,
  nextSeason: () => {
    throw new Error(
      'The SeasonContext has been used before its initialization',
    );
  },
});

type Props = {
  children: ReactNode;
};

export const SeasonProvider = ({ children }: Props): ReactNode => {
  const [season, setSeason] = useState<Season>(Seasons.Spring);

  const nextSeason = useCallback((): void => {
    setSeason((prev) => {
      const prevIdx = AllSeasons.findIndex((s) => s === prev);
      const newIdx = (prevIdx + 1) % AllSeasons.length;

      return Seasons[AllSeasons[newIdx]];
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      season,
      nextSeason,
    }),
    [season, nextSeason],
  );

  return (
    <SeasonContext.Provider value={contextValue}>
      {children}
    </SeasonContext.Provider>
  );
};

export const useSeason = (): SeasonContextType =>
  useContext<SeasonContextType>(SeasonContext);
