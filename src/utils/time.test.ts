import { describe, expect, it } from 'vitest';

import { isLeapYear } from './time';

describe('isLeapYear', () => {
  it('should correctly identify leap years', () => {
    const leapYears = [2000, 2004, 2008, 2012, 2016, 2020, 2024, 2400];
    leapYears.forEach((year) => {
      expect(isLeapYear(year)).toBe(true);
    });
  });

  it('should correctly identify non-leap years', () => {
    const nonLeapYears = [1900, 1901, 2001, 2002, 2003, 2100, 2200, 2300];
    nonLeapYears.forEach((year) => {
      expect(isLeapYear(year)).toBe(false);
    });
  });

  it('should handle years divisible by 4 but not by 100', () => {
    expect(isLeapYear(2004)).toBe(true);
    expect(isLeapYear(2024)).toBe(true);
  });

  it('should handle years divisible by 100 but not by 400', () => {
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2100)).toBe(false);
  });

  it('should handle years divisible by 400', () => {
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2400)).toBe(true);
  });
});
