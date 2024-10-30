import { describe, expect, it } from 'vitest';

import { FormattedHeatLoss, HeatLossUnit } from '@/types/heatLoss';
import { TimeUnit, TimeUnitType } from '@/types/time';
import {
  calculateHeatLossConstantFactor,
  formatHeatLossRate,
  sumHeatLossRate,
} from '@/utils/heatLoss';

import { timeConversionFactors } from './time';

describe('Heat Loss Utils', () => {
  describe('calculateHeatLossConstantFactor', () => {
    it('should calculate the correct heat loss constant factor', () => {
      const thermalConductivity = 0.2; // W/m·K
      const area = 10; // m²
      const materialThickness = 0.5; // m
      const expectedFactor = (thermalConductivity * area) / materialThickness;

      const result = calculateHeatLossConstantFactor({
        thermalConductivity,
        area,
        materialThickness,
      });

      expect(result).toBe(expectedFactor);
    });

    it('should throw an error if thermal conductivity is non-positive', () => {
      const thermalConductivity = 0;
      const area = 10;
      const materialThickness = 0.5;

      expect(() =>
        calculateHeatLossConstantFactor({
          thermalConductivity,
          area,
          materialThickness,
        }),
      ).toThrowError('The thermal conductivity (k) must be greater than 0.');

      expect(() =>
        calculateHeatLossConstantFactor({
          thermalConductivity: -1,
          area,
          materialThickness,
        }),
      ).toThrowError('The thermal conductivity (k) must be greater than 0.');
    });

    it('should throw an error if material thickness is non-positive', () => {
      const thermalConductivity = 0.2;
      const area = 10;
      const materialThickness = 0;

      expect(() =>
        calculateHeatLossConstantFactor({
          thermalConductivity,
          area,
          materialThickness,
        }),
      ).toThrowError("The material's thickness (d) must be greater than 0.");

      expect(() =>
        calculateHeatLossConstantFactor({
          thermalConductivity,
          area,
          materialThickness: -1,
        }),
      ).toThrowError("The material's thickness (d) must be greater than 0.");
    });
  });

  describe('sumHeatLossRate', () => {
    it('should return 0 when there are no temperatures', () => {
      const result = sumHeatLossRate({
        temperatures: [],
        constantFactor: 10,
        indoorTemperature: 20,
        timeUnit: TimeUnit.Hours,
      });
      expect(result).toBe(0);
    });

    it('should calculate the correct total heat loss for positive heat loss values', () => {
      const temperatures = [10, 12, 15];
      const constantFactor = 2;
      const indoorTemperature = 20;
      const timeUnit = TimeUnit.Hours;
      const expectedHeatLoss =
        constantFactor * (indoorTemperature - temperatures[0]) +
        constantFactor * (indoorTemperature - temperatures[1]) +
        constantFactor * (indoorTemperature - temperatures[2]);

      const result = sumHeatLossRate({
        temperatures,
        constantFactor,
        indoorTemperature,
        timeUnit,
      });
      expect(result).toBe(expectedHeatLoss);
    });

    it('should handle negative heat loss values (cooling) by treating them as 0', () => {
      const temperatures = [25, 28, 30]; // Outdoor temps higher than indoor
      const constantFactor = 2;
      const indoorTemperature = 20;
      const timeUnit = TimeUnit.Days;
      const expectedHeatLoss = 0; // Expected heat loss should be 0 as we are cooling

      const result = sumHeatLossRate({
        temperatures,
        constantFactor,
        indoorTemperature,
        timeUnit,
      });
      expect(result).toBe(expectedHeatLoss);
    });

    it('should calculate the correct total heat loss with different time units', () => {
      const temperatures = [10, 12, 15];
      const constantFactor = 2;
      const indoorTemperature = 20;

      const timeUnits: TimeUnitType[] = Object.keys(TimeUnit) as TimeUnitType[];

      timeUnits.forEach((timeUnit) => {
        const expectedHeatLoss =
          (constantFactor * (indoorTemperature - temperatures[0]) +
            constantFactor * (indoorTemperature - temperatures[1]) +
            constantFactor * (indoorTemperature - temperatures[2])) *
          timeConversionFactors[timeUnit];
        const result = sumHeatLossRate({
          temperatures,
          constantFactor,
          indoorTemperature,
          timeUnit,
        });
        expect(result).toBe(expectedHeatLoss);
      });
    });

    it('should handle a mix of positive and negative heat loss values', () => {
      const temperatures = [10, 25, 15]; // Mix of outdoor temps below and above indoor
      const constantFactor = 2;
      const indoorTemperature = 20;
      const timeUnit = TimeUnit.Hours;
      const expectedHeatLoss =
        constantFactor * (indoorTemperature - temperatures[0]) +
        0 +
        constantFactor * (indoorTemperature - temperatures[2]); // Only positive heat loss contributes

      const result = sumHeatLossRate({
        temperatures,
        constantFactor,
        indoorTemperature,
        timeUnit,
      });
      expect(result).toBe(expectedHeatLoss);
    });
  });

  describe('formatHeatLossRate', () => {
    it('should format heat loss in watts when less than 1 kW', () => {
      const watts = 500;
      const expectedFormattedHeatLoss: FormattedHeatLoss = {
        value: 500,
        unit: HeatLossUnit.Watt,
      };
      expect(formatHeatLossRate(watts)).toEqual(expectedFormattedHeatLoss);
    });

    it('should format heat loss in kilowatts when between 1 kW and 1 MW', () => {
      const watts = 1500;
      const expectedFormattedHeatLoss: FormattedHeatLoss = {
        value: 1.5,
        unit: HeatLossUnit.KiloWatt,
      };
      expect(formatHeatLossRate(watts)).toEqual(expectedFormattedHeatLoss);

      const watts2 = 150000;
      const expectedFormattedHeatLoss2: FormattedHeatLoss = {
        value: 150,
        unit: HeatLossUnit.KiloWatt,
      };
      expect(formatHeatLossRate(watts2)).toEqual(expectedFormattedHeatLoss2);
    });

    it('should format heat loss in megawatts when greater than or equal to 1 MW', () => {
      const watts = 1_500_000;
      const expectedFormattedHeatLoss: FormattedHeatLoss = {
        value: 1.5,
        unit: HeatLossUnit.MegaWatt,
      };
      expect(formatHeatLossRate(watts)).toEqual(expectedFormattedHeatLoss);

      const watts2 = 10_000_000;
      const expectedFormattedHeatLoss2: FormattedHeatLoss = {
        value: 10,
        unit: HeatLossUnit.MegaWatt,
      };
      expect(formatHeatLossRate(watts2)).toEqual(expectedFormattedHeatLoss2);
    });

    it('should handle zero watts correctly', () => {
      const watts = 0;
      const expectedFormattedHeatLoss: FormattedHeatLoss = {
        value: 0,
        unit: HeatLossUnit.Watt,
      };
      expect(formatHeatLossRate(watts)).toEqual(expectedFormattedHeatLoss);
    });

    it('should handle boundary values correctly', () => {
      const testCases: [number, FormattedHeatLoss][] = [
        [999, { value: 999, unit: HeatLossUnit.Watt }],
        [1000, { value: 1, unit: HeatLossUnit.KiloWatt }],
        [1001, { value: 1, unit: HeatLossUnit.KiloWatt }], // Tests rounding down
        [1499, { value: 1.5, unit: HeatLossUnit.KiloWatt }], // Tests rounding up
        [1500, { value: 1.5, unit: HeatLossUnit.KiloWatt }],
        [999_999, { value: 1000, unit: HeatLossUnit.KiloWatt }], // Tests rounding up
        [1_000_000, { value: 1, unit: HeatLossUnit.MegaWatt }],
        [1_000_001, { value: 1, unit: HeatLossUnit.MegaWatt }], // Tests rounding down
        [1_499_999, { value: 1.5, unit: HeatLossUnit.MegaWatt }], // Tests rounding up
        [1_500_000, { value: 1.5, unit: HeatLossUnit.MegaWatt }],
      ];

      testCases.forEach(([watts, expected]) => {
        expect(formatHeatLossRate(watts)).toEqual(expected);
      });
    });

    it('should handle negative values (should not happen but test for robustness)', () => {
      const watts = -500;
      const expectedFormattedHeatLoss: FormattedHeatLoss = {
        value: -500, // Should still format correctly, even if negative values are unexpected
        unit: HeatLossUnit.Watt,
      };
      expect(formatHeatLossRate(watts)).toEqual(expectedFormattedHeatLoss);
    });
  });
});
