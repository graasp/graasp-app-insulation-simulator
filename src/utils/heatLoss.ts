import { FormattedHeatLoss, HeatLossUnit } from '@/types/heatLoss';
import { TimeUnitType } from '@/types/time';

import { timeConversionFactors } from './time';

/**
 * Calculates the constant factor for the rate of heat loss through a solid material.
 *
 * @param thermalConductivity - Thermal conductivity of the material (W/m·K).
 * @param area - Area through which heat is being lost (m²).
 * @param materialThickness - Thickness of the material (m).
 * @returns The heat loss constant factor (W/K).
 * @throws Will throw an error if thermal conductivity or material thickness is non-positive.
 */
export const calculateHeatLossConstantFactor = ({
  thermalConductivity,
  area,
  materialThickness,
}: {
  thermalConductivity: number;
  area: number;
  materialThickness: number;
}): number => {
  if (thermalConductivity <= 0) {
    throw new Error('The thermal conductivity (k) must be greater than 0.');
  }
  if (materialThickness <= 0) {
    throw new Error("The material's thickness (d) must be greater than 0.");
  }

  return (thermalConductivity * area) / materialThickness;
};

/**
 * Calculates the rate of heat loss based on the constant factor and temperature difference.
 * TODO: confirm that negative heat loss (so we should cool the house) are negligated
 * When a heat loss negative is, the rate of heat loss returned is 0.
 *
 * @param constantFactor - The heat loss constant factor (W/K).
 * @param indoorTemperature - Indoor temperature (°C).
 * @param outdoorTemperature - Outdoor temperature (°C).
 * @returns The rate of heat loss (W or J/s).
 */
export const calculateHeatLossRate = ({
  constantFactor,
  indoorTemperature,
  outdoorTemperature,
}: {
  constantFactor: number;
  indoorTemperature: number;
  outdoorTemperature: number;
}): number => {
  const heatLoss = constantFactor * (indoorTemperature - outdoorTemperature);
  return heatLoss > 0 ? heatLoss : 0;
};

/**
 * Calculates the total heat loss rate based on an array of outdoor temperatures.
 *
 * @param temperatures - An array of outdoor temperatures (°C).
 * @param constantFactor - A constant factor used in the heat loss calculation (W/K).
 * @param indoorTemperature - The indoor temperature for comparison in the heat loss rate calculation (°C).
 * @param timeUnit - The time unit corresponding to the frequency of the temperature measurements.
 *                   Its indicate whether the temperatures are recorded once per hour, once per day, etc.
 *                   This affects the total heat loss calculation by scaling the rate according to the measurement frequency.
 * @returns The total heat loss rate summed over all specified outdoor temperatures (W or J/s).
 */
export const sumHeatLossRate = ({
  temperatures,
  constantFactor,
  indoorTemperature,
  timeUnit,
}: {
  temperatures: number[];
  constantFactor: number;
  indoorTemperature: number;
  timeUnit: TimeUnitType;
}): number =>
  temperatures.reduce(
    (sum, temperature) =>
      sum +
      calculateHeatLossRate({
        constantFactor,
        indoorTemperature,
        outdoorTemperature: temperature,
      }) *
        timeConversionFactors[timeUnit],
    0,
  );

/**
 * Conversion factors for different units of power.
 *
 * This object contains the conversion factors from each unit of power to Watts.
 *
 * @property Watt - Conversion factor for Watt to Watts (1).
 * @property KiloWatt - Conversion factor for KiloWatt to Watts (1,000).
 * @property MegaWatt - Conversion factor for MegaWatt to Watts (1,000,000).
 */
export const powerConversionFactors: {
  [key in keyof typeof HeatLossUnit]: number;
} = {
  Watt: 1,
  KiloWatt: 1_000,
  MegaWatt: 1_000_000,
};

/**
 * Formats a given heat loss rate in watts into a more readable format
 * with appropriate units (W, kW, or MW).
 *
 * @param watts - The heat loss rate in watts.
 * @returns An object containing the formatted value and its unit.
 */
export const formatHeatLossRate = (watts: number): FormattedHeatLoss => {
  switch (true) {
    case watts < powerConversionFactors.KiloWatt:
      return { value: Math.round(watts), unit: HeatLossUnit.Watt };
    case watts < powerConversionFactors.MegaWatt:
      return {
        value: parseFloat((watts / powerConversionFactors.KiloWatt).toFixed(1)),
        unit: HeatLossUnit.KiloWatt,
      };
    default:
      return {
        value: parseFloat((watts / powerConversionFactors.MegaWatt).toFixed(1)),
        unit: HeatLossUnit.MegaWatt,
      };
  }
};
