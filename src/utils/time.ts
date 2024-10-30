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

export const formatHours = (hours: number): FormattedTime => {
  const HOURS_IN_YEAR = timeConversionFactors[TimeUnit.Years];
  const HOURS_IN_MONTH = timeConversionFactors[TimeUnit.Months];
  const HOURS_IN_WEEK = timeConversionFactors[TimeUnit.Weeks];
  const HOURS_IN_DAY = timeConversionFactors[TimeUnit.Days];

  if (hours >= HOURS_IN_YEAR) {
    // Year (approximate - doesn't account for leap years)
    return { value: Math.round(hours / HOURS_IN_YEAR), unit: TimeUnit.Years };
  }
  if (hours >= HOURS_IN_MONTH) {
    // Month (approximate)
    return { value: Math.round(hours / HOURS_IN_MONTH), unit: TimeUnit.Months };
  }
  if (hours >= HOURS_IN_WEEK) {
    // Week
    return { value: Math.round(hours / HOURS_IN_WEEK), unit: TimeUnit.Weeks };
  }
  if (hours >= HOURS_IN_DAY) {
    // Day
    return { value: Math.round(hours / HOURS_IN_DAY), unit: TimeUnit.Days };
  }
  // Hour
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
