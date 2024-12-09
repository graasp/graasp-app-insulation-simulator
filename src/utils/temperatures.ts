import Papa from 'papaparse';

import { TemperatureRow, UserOutdoorTemperature } from '@/types/temperatures';

/**
 * Loads temperature data from a CSV file and returns it as a promise.
 *
 * @param csvFile - The csv file to load.
 *                  - The CSV file must contain a header.
 *                  - The first column is the time (GMT+0) in ISO 8601.
 *                  - The second column is the temperature in °C.
 *
 * @returns A promise that resolves with an array of TemperatureRow objects,
 *  or rejects with an error if parsing fails.
 */
export const loadTemperaturesFromCSV = (
  csvFile: string,
): Promise<TemperatureRow[]> =>
  new Promise((resolve, reject) => {
    Papa.parse<TemperatureRow>(csvFile, {
      download: true,
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length) {
          reject(
            new Error(`Errors while parsing:${JSON.stringify(results.errors)}`),
          );
        } else {
          resolve(results.data);
        }
      },
    });
  });

export const getOutdoorTemperature = ({
  weather,
  userTemperature,
}: {
  weather: number;
  userTemperature: UserOutdoorTemperature;
}): number => (userTemperature.userOverride ? userTemperature.value : weather);
