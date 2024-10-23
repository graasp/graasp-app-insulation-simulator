import Papa from 'papaparse';

import { TemperatureRow } from '@/types/temperatures';

/**
 * Loads temperature data from a CSV file and returns it as a promise.
 *
 * @returns A promise that resolves with an array of TemperatureRow objects,
 *  or rejects with an error if parsing fails.
 */
export const loadTemperaturesFromCSV = (): Promise<TemperatureRow[]> =>
  new Promise((resolve, reject) => {
    Papa.parse<TemperatureRow>('temperatures.csv', {
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
