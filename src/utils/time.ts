import { FormattedTime, TimeUnit, TimeUnitType } from '@/types/time';

export const timeConversionFactors: { [key in TimeUnitType]: number } = {
  [TimeUnit.Hours]: 1,
  [TimeUnit.Days]: 24,
  [TimeUnit.Weeks]: 24 * 7,
  [TimeUnit.Months]: 24 * 30, // Approximate as 30 days
  [TimeUnit.Years]: 24 * 365, // Approximate as 365 days
} as const;

export const formatHoursToDays = (hours: number): FormattedTime => {
  const days = Math.floor(hours / timeConversionFactors.Days);

  if (days > 0) {
    return { value: days, unit: TimeUnit.Days };
  }

  return { value: hours, unit: TimeUnit.Hours };
};

export const dateDiffInDays = (from: Date, to: Date): number => {
  const diffInMs = to.getTime() - from.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diffInMs / oneDay);
};

export const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

export const getDayOfYear = (date: Date): number => {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  return dateDiffInDays(startOfYear, date);
};
