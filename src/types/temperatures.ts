export type TemperatureRow = {
  time: string;
  temperature: number;
};

export type UserOutdoorTemperature = {
  /**
   * Indicates whether the user has overridden the temperature from the weather data.
   */
  userOverride: boolean;

  /**
   * This will be the user value if set.
   */
  value: number;
};
