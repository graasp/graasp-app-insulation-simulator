import { UnionOfConst } from '@graasp/sdk';

import { Seasons } from '@/types/seasons';

import { getDayOfYear, isLeapYear } from './time';

/**
 * Determines the season of a given date.
 *
 * @param date The given date.
 * @param to The end date of the range (inclusive).
 * @returns The season of the specified date.
 */
export const getSeason = (date: Date): UnionOfConst<typeof Seasons> => {
  const dayOfYear = getDayOfYear(date);
  const leapYearOffset = isLeapYear(date.getFullYear()) ? 1 : 0; // Offset for leap years

  // Define season start days (adjust for leap years)
  const springStart = 79 + leapYearOffset; // March 20
  const summerStart = 172; // June 21 (20 for leap years)
  const autumnStart = 265 + leapYearOffset; // September 22
  const winterStart = 355 + leapYearOffset; // December 21

  switch (true) {
    case dayOfYear >= springStart && dayOfYear < summerStart:
      return Seasons.Spring;
    case dayOfYear >= summerStart && dayOfYear < autumnStart:
      return Seasons.Summer;
    case dayOfYear >= autumnStart && dayOfYear < winterStart:
      return Seasons.Autumn;
    default:
      return Seasons.Winter;
  }
};
