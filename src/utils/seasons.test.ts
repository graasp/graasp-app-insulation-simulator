import { UnionOfConst } from '@graasp/sdk';

import { describe, expect, it } from 'vitest';

import { Seasons } from '@/types/seasons';
import { getSeason } from '@/utils/seasons';

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
});
