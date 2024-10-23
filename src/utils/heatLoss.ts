import {
  FormattedHeatLoss,
  HeatLossUnit,
  heatLossUnitByValue,
} from '@/types/heatLoss';

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

// TODO: move these two?
const energyConversionFactors: { [key in keyof typeof HeatLossUnit]: number } =
  {
    Watt: 1,
    KiloWatt: 1_000,
    MegaWatt: 1_000_000,
  };
export const calculateElectricityCost = (
  electricityCostKwh: number,
  formattedHeatLoss: FormattedHeatLoss,
): number => {
  const toWatt =
    formattedHeatLoss.value *
    energyConversionFactors[heatLossUnitByValue[formattedHeatLoss.unit]];
  const toKiloWatt = toWatt / energyConversionFactors.KiloWatt;

  return toKiloWatt * electricityCostKwh;
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
    case watts < energyConversionFactors.KiloWatt:
      return { value: Math.round(watts), unit: HeatLossUnit.Watt };
    case watts < energyConversionFactors.MegaWatt:
      return {
        value: Math.round(watts / energyConversionFactors.KiloWatt),
        unit: HeatLossUnit.KiloWatt,
      };
    default:
      return {
        value: Math.round(watts / energyConversionFactors.MegaWatt),
        unit: HeatLossUnit.MegaWatt,
      };
  }
};

/**
 * Calculates the total heat loss rate based on an array of outdoor temperatures.
 *
 * @param temperatures - An array of outdoor temperatures.
 * @param constantFactor - A constant factor used in the heat loss calculation.
 * @param indoorTemperature - The indoor temperature for comparison in the heat loss rate calculation.
 * @returns The total heat loss rate summed over all specified outdoor temperatures.
 */
export const sumHeatLossRate = ({
  temperatures,
  constantFactor,
  indoorTemperature,
}: {
  temperatures: number[];
  constantFactor: number;
  indoorTemperature: number;
}): number =>
  temperatures.reduce(
    (sum, temperature) =>
      sum +
      calculateHeatLossRate({
        constantFactor,
        indoorTemperature,
        outdoorTemperature: temperature,
      }),
    0,
  );
