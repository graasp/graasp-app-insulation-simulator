export const TimeUnit = {
  Hours: 'Hours',
  Days: 'Days',
  Weeks: 'Weeks',
  Months: 'Months',
  Years: 'Years',
} as const;
export type TimeUnitType = keyof typeof TimeUnit;

export type FormattedTime = {
  value: number;
  unit: TimeUnitType;
};
