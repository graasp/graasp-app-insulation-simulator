import { ReactNode, createContext, useContext, useMemo, useState } from 'react';

import { undefinedContextErrorFactory } from '@/utils/context';

type Period = {
  numberOfDays: number;
  labelKey:
    | 'ONE_MONTH'
    | 'THREE_MONTHS'
    | 'SIX_MONTHS'
    | 'ONE_YEAR'
    | 'THREE_YEARS';
};

export const PERIODS: Period[] = [
  { numberOfDays: 30, labelKey: 'ONE_MONTH' },
  { numberOfDays: 90, labelKey: 'THREE_MONTHS' },
  { numberOfDays: 180, labelKey: 'SIX_MONTHS' },
  { numberOfDays: 365, labelKey: 'ONE_YEAR' },
  { numberOfDays: 1_095, labelKey: 'THREE_YEARS' },
] as const;

type ChartContextType = {
  period: Period;
  updatePeriod: (periodValue: number) => void;
};

const ChartContext = createContext<ChartContextType | null>(null);

type Props = {
  children: ReactNode;
};

export const ChartProvider = ({ children }: Props): ReactNode => {
  const [period, setPeriod] = useState(PERIODS[0]);

  const updatePeriod = (periodValue: number): void =>
    setPeriod(
      PERIODS.find((p) => periodValue === p.numberOfDays) ?? PERIODS[0],
    );

  const contextValue = useMemo(
    () => ({
      period,
      updatePeriod,
    }),
    [period],
  );

  return (
    <ChartContext.Provider value={contextValue}>
      {children}
    </ChartContext.Provider>
  );
};

export const useChart = (): ChartContextType => {
  const context = useContext(ChartContext);

  if (!context) {
    throw undefinedContextErrorFactory('Chart');
  }

  return context;
};
