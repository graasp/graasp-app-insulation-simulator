import { describe, expect, it } from 'vitest';

import { FormattedHeatLoss, HeatLossUnit } from '@/types/heatLoss';
import {
  calculateHeatLossConstantFactor,
  formatHeatLossRate,
  sumHeatLossRateForDay,
} from '@/utils/heatLoss';

describe('Heat Loss Utils', () => {
  describe('calculateHeatLossConstantFactor', () => {
    it('should calculate the correct heat loss constant factor', () => {
      const area = 10; // m²
      const thermalConductivity = 0.2; // W/m·K
      const materialThickness = 0.5; // m
      const expectedFactor = (thermalConductivity * area) / materialThickness;

      const result = calculateHeatLossConstantFactor({
        area,
        materials: [{ thickness: materialThickness, thermalConductivity }],
      });

      expect(result).toBe(expectedFactor);
    });

    it('should calculate the correct heat loss constant factor if multiple materials', () => {
      // This is an example with a double pane window
      const area = 2;
      const airMaterial = {
        thermalConductivity: 0.024,
        thickness: 0.005,
      };
      const windowMaterial = {
        thermalConductivity: 0.8,
        thickness: 0.005,
      };

      const expectedFactor =
        area /
        ((2 * windowMaterial.thickness) / windowMaterial.thermalConductivity +
          airMaterial.thickness / airMaterial.thermalConductivity);

      const result = calculateHeatLossConstantFactor({
        area,
        materials: [windowMaterial, airMaterial, windowMaterial],
      });

      expect(result).toBe(expectedFactor);
    });

    it('should throw an error if thermal conductivity is non-positive', () => {
      const area = 10;
      const thermalConductivity = 0;
      const materialThickness = 0.5;

      expect(() =>
        calculateHeatLossConstantFactor({
          area,
          materials: [{ thickness: materialThickness, thermalConductivity }],
        }),
      ).toThrowError('The thermal conductivity (k) must be greater than 0.');

      expect(() =>
        calculateHeatLossConstantFactor({
          area,
          materials: [
            { thickness: materialThickness, thermalConductivity: -1 },
          ],
        }),
      ).toThrowError('The thermal conductivity (k) must be greater than 0.');
    });

    it('should throw an error if material thickness is non-positive', () => {
      const area = 10;
      const thermalConductivity = 0.2;
      const materialThickness = 0;

      expect(() =>
        calculateHeatLossConstantFactor({
          area,
          materials: [{ thickness: materialThickness, thermalConductivity }],
        }),
      ).toThrowError("The material's thickness (d) must be greater than 0.");

      expect(() =>
        calculateHeatLossConstantFactor({
          area,
          materials: [{ thickness: -1, thermalConductivity }],
        }),
      ).toThrowError("The material's thickness (d) must be greater than 0.");
    });
  });

  describe('sumHeatLossRateForDay', () => {
    it('should calculate the correct total heat loss for positive heat loss values', () => {
      const temperature = 10;
      const constantFactor = 2;
      const indoorTemperature = 20;
      const expectedHeatLoss =
        constantFactor * (indoorTemperature - temperature) * 24;

      const result = sumHeatLossRateForDay({
        temperature,
        constantFactor,
        indoorTemperature,
      });
      expect(result).toBe(expectedHeatLoss);
    });

    it('should handle negative heat loss values (cooling) by treating them as 0', () => {
      const temperature = 30; // Outdoor temperature higher than indoor
      const constantFactor = 2;
      const indoorTemperature = 20;
      const expectedHeatLoss = 0; // Expected heat loss should be 0 as we are cooling

      const result = sumHeatLossRateForDay({
        temperature,
        constantFactor,
        indoorTemperature,
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
