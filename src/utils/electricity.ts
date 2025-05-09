/**
 * Calculates the total electricity cost based on the price per kWh and total energy consumption.
 *
 * @param pricekWh - The cost of electricity per kilowatt-hour (kWh).
 * @param energyConsumptionkWh - The energy consumption in kilowatt-hours (kWh) over the specified period.
 * @returns The total electricity cost.
 * @throws Will throw an error if the price per kWh is less than or equal to zero,
 *         or if the total energy consumption is negative.
 */
export const electricityCost = ({
  pricekWh,
  energyConsumptionkWh,
}: {
  pricekWh: number;
  energyConsumptionkWh: number;
}): number => {
  if (pricekWh <= 0) {
    throw new Error('The cost of electricity must be greater than 0.');
  }
  if (energyConsumptionkWh < 0) {
    throw new Error('Total energy consumption must be a non-negative value.');
  }

  return Math.round(pricekWh * energyConsumptionkWh);
};
