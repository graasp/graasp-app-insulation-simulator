export type TemperatureRow = {
  time: string;
  temperature: number;
};

export type OutdoorTemperature = {
  /**
   * Indicates whether the user has overridden the temperature from the weather data.
   */
  userOverride: boolean;

  /**
   * The temperature value from the weather data source.
   */
  weatherValue: number; // More descriptive name

  /**
   * The effective outdoor temperature used in the simulation.
   * This will be the user value if set, otherwise it will be the `weatherValue`.
   */
  value: number;
};
