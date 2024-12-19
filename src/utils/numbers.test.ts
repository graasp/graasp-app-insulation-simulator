import { describe, expect, it } from 'vitest';

import { formatNumber } from '@/utils/numbers';

describe('formatNumber', () => {
  it('should format numbers correctly with thousands separators', () => {
    expect(formatNumber(1)).toBe('1');
    expect(formatNumber(12)).toBe('12');
    expect(formatNumber(123)).toBe('123');
    expect(formatNumber(1234)).toBe("1'234");
    expect(formatNumber(12345)).toBe("12'345");
    expect(formatNumber(123456)).toBe("123'456");
    expect(formatNumber(1234567)).toBe("1'234'567");
    expect(formatNumber(12345678)).toBe("12'345'678");
    expect(formatNumber(123456789)).toBe("123'456'789");
    expect(formatNumber(1234567890)).toBe("1'234'567'890");
  });

  it('should handle zero correctly', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('should handle negative numbers correctly', () => {
    expect(formatNumber(-1)).toBe('-1');
    expect(formatNumber(-12)).toBe('-12');
    expect(formatNumber(-123)).toBe('-123');
    expect(formatNumber(-1234)).toBe("-1'234");
    expect(formatNumber(-12345)).toBe("-12'345");
    expect(formatNumber(-1234567)).toBe("-1'234'567");
  });

  it('should handle floating point numbers by discarding the decimal part', () => {
    expect(formatNumber(1234.56)).toBe("1'234.56");
    expect(formatNumber(1234567.89)).toBe("1'234'567.89");
  });
});
