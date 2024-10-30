import { UnionOfConst } from '@graasp/sdk';

import { Seasons } from '@/types/seasons';

import { dateDiffInDays, getDayOfYear, isLeapYear } from './time';

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

/**
 * Determines the most present season within a given date range.
 *
 * @param from The start date of the range (inclusive).
 * @param to The end date of the range (inclusive).
 * @returns The most present season within the specified date range.  If the date range is empty or invalid (e.g., 'from' is after 'to'), it throws an error. If multiple seasons have the same highest count, the function returns the first one encountered.
 */
export const getMostPresentSeason = (
  from: Date,
  to: Date,
): UnionOfConst<typeof Seasons> => {
  if (!from || !to) {
    throw new Error('The dates must be defined.');
  }

  if (from > to) {
    throw new Error('The date from must be smaller than date to.');
  }

  const seasonCounts = {
    [Seasons.Spring]: 0,
    [Seasons.Summer]: 0,
    [Seasons.Autumn]: 0,
    [Seasons.Winter]: 0,
  };

  let mostPresent: { season: UnionOfConst<typeof Seasons>; count: number } = {
    season: Seasons.Spring,
    count: -1,
  };

  for (let i = 0; i < dateDiffInDays(from, to) + 1; i += 1) {
    const currentDate = new Date(from);
    currentDate.setDate(from.getDate() + i);
    const currentSeason = getSeason(currentDate);
    seasonCounts[currentSeason] += 1;

    if (seasonCounts[currentSeason] > mostPresent.count) {
      mostPresent = {
        season: currentSeason,
        count: seasonCounts[currentSeason],
      };
    }
  }

  return mostPresent.season;
};
