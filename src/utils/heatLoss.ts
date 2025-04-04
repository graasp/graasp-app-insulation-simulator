import { BuildingMaterial } from '@/models/BuildingMaterial';
import { FormattedHeatLoss, HeatLossUnit } from '@/types/heatLoss';
import { NonEmptyArray } from '@/types/utils';

import { formatFloat } from './numbers';

/**
 * Calculates the overall heat transfer coefficient (U-value) for a composite material.
 *  The U-value represents the rate of heat transfer through a unit area of a structure divided by the temperature difference across that structure.
 *
 * @param area - Surface area through which heat is transferred (m²).
 * @param materials - Array of material objects, each with thermal conductivity and thickness.
 * @returns The overall heat transfer coefficient (U-value) in W/m²K.
 * @throws Will throw an error if any material has non-positive thermal conductivity or thickness.
 */
export const calculateHeatLossConstantFactor = ({
  area,
  materials,
}: {
  area: number;
  materials: NonEmptyArray<
    Pick<BuildingMaterial, 'thermalConductivity' | 'thickness'>
  >;
}): number => {
  if (materials.some((m) => m.thermalConductivity <= 0)) {
    throw new Error('The thermal conductivity (k) must be greater than 0.');
  }
  if (materials.some((m) => m.thickness <= 0)) {
    throw new Error("The material's thickness (d) must be greater than 0.");
  }

  // Calculate the total thermal resistance (R-value) of the composite material.
  const totalThermalResistance = materials.reduce(
    (acc, material) => acc + material.thickness / material.thermalConductivity,
    0,
  );

  // Handle case where thermal resistance is zero to avoid division by zero.
  if (totalThermalResistance === 0) {
    return 0;
  }

  return area / totalThermalResistance;
};

/**
 * Calculates the rate of heat loss based on the constant factor and temperature difference.
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
 * Calculates the total heat loss rate per day based on an array of outdoor temperatures.
 *
 * @param temperatures - An array of outdoor temperatures (°C).
 * @param constantFactor - A constant factor used in the heat loss calculation (W/K).
 * @param indoorTemperature - The indoor temperature for comparison in the heat loss rate calculation (°C).
 * @returns The total heat loss rate per day summed over all specified outdoor temperatures (W or J/s).
 */
export const sumHeatLossRateForDay = ({
  temperature,
  constantFactor,
  indoorTemperature,
}: {
  temperature: number;
  constantFactor: number;
  indoorTemperature: number;
}): number =>
  calculateHeatLossRate({
    constantFactor,
    indoorTemperature,
    outdoorTemperature: temperature,
  }) * 24; // multiply by 24 because its for the whole day.

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
        value: formatFloat(watts / powerConversionFactors.KiloWatt),
        unit: HeatLossUnit.KiloWatt,
      };
    default:
      return {
        value: formatFloat(watts / powerConversionFactors.MegaWatt),
        unit: HeatLossUnit.MegaWatt,
      };
  }
};
