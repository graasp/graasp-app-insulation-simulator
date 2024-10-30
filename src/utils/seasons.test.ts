import { UnionOfConst } from '@graasp/sdk';

import { describe, expect, it } from 'vitest';

import { Seasons } from '@/types/seasons';
import { getMostPresentSeason, getSeason } from '@/utils/seasons';

describe('Tests seasons utils', () => {
  describe('getSeason', () => {
    it('should return the correct season for a given leap year date', () => {
      const testCases: [Date, UnionOfConst<typeof Seasons>][] = [
        [new Date('2024-03-19'), Seasons.Winter], // Winter
        [new Date('2024-03-20'), Seasons.Spring], // Spring start
        [new Date('2024-04-15'), Seasons.Spring], // Spring
        [new Date('2024-04-19'), Seasons.Spring], // Spring end
        [new Date('2024-06-20'), Seasons.Summer], // Summer start
        [new Date('2024-07-20'), Seasons.Summer], // Summer
        [new Date('2024-09-21'), Seasons.Summer], // Summer end
        [new Date('2024-09-22'), Seasons.Autumn], // Autumn start
        [new Date('2024-10-20'), Seasons.Autumn], // Autumn
        [new Date('2024-12-20'), Seasons.Autumn], // Autumn end
        [new Date('2024-12-21'), Seasons.Winter], // Winter start
        [new Date('2024-01-20'), Seasons.Winter], // Winter
        [new Date('2024-02-20'), Seasons.Winter], // Winter
      ];

      testCases.forEach(([date, expectedSeason]) => {
        expect(getSeason(date)).toBe(expectedSeason);
      });
    });

    it('should return the correct season for a given date', () => {
      const testCases: [Date, UnionOfConst<typeof Seasons>][] = [
        [new Date('2025-03-19'), Seasons.Winter], // Winter
        [new Date('2025-03-20'), Seasons.Spring], // Spring start
        [new Date('2025-04-15'), Seasons.Spring], // Spring
        [new Date('2025-04-20'), Seasons.Spring], // Spring end
        [new Date('2025-06-21'), Seasons.Summer], // Summer start
        [new Date('2025-07-20'), Seasons.Summer], // Summer
        [new Date('2025-09-21'), Seasons.Summer], // Summer end
        [new Date('2025-09-22'), Seasons.Autumn], // Autumn start
        [new Date('2025-10-20'), Seasons.Autumn], // Autumn
        [new Date('2025-12-20'), Seasons.Autumn], // Autumn end
        [new Date('2025-12-21'), Seasons.Winter], // Winter start
        [new Date('2025-01-20'), Seasons.Winter], // Winter
        [new Date('2025-02-20'), Seasons.Winter], // Winter
      ];

      testCases.forEach(([date, expectedSeason]) => {
        expect(getSeason(date)).toBe(expectedSeason);
      });
    });
  });

  describe('getMostPresentSeason', () => {
    it('should return the correct most present season', () => {
      const testCases: [Date, Date, (typeof Seasons)[keyof typeof Seasons]][] =
        [
          [new Date('2024-03-15'), new Date('2024-04-15'), Seasons.Spring],
          [new Date('2024-06-15'), new Date('2024-09-25'), Seasons.Summer],
          [new Date('2024-09-15'), new Date('2024-12-25'), Seasons.Autumn],
          [new Date('2024-03-20'), new Date('2024-06-20'), Seasons.Spring], // Exact season boundaries
          [new Date('2024-12-15'), new Date('2025-03-25'), Seasons.Winter], // Spans across year end
          [new Date('2024-03-20'), new Date('2024-07-20'), Seasons.Spring], // Full spring and half of summer
        ];

      testCases.forEach(([from, to, expectedSeason]) => {
        expect(getMostPresentSeason(from, to)).toBe(expectedSeason);
      });
    });

    it('should throw an error if "from" is after "to"', () => {
      const from = new Date('2024-04-01');
      const to = new Date('2024-03-15');
      expect(() => getMostPresentSeason(from, to)).toThrowError(
        'The date from must be smaller than date to.',
      );
    });

    it('should throw an error if "from" or "to" is null', () => {
      const from = new Date('2024-03-15');
      const to = null as unknown as Date; // Need type assertion for null test

      expect(() => getMostPresentSeason(from, to)).toThrowError(
        'The dates must be defined.',
      );
      expect(() =>
        getMostPresentSeason(null as unknown as Date, from),
      ).toThrowError('The dates must be defined.');
      expect(() =>
        getMostPresentSeason(null as unknown as Date, null as unknown as Date),
      ).toThrowError('The dates must be defined.');
    });

    it('should handle a single day correctly', () => {
      const date = new Date('2024-04-15');
      expect(getMostPresentSeason(date, date)).toBe(Seasons.Spring);
    });
  });
});
