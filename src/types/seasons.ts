export const Seasons = {
  Winter: 'Winter',
  Spring: 'Spring',
  Summer: 'Summer',
  Autumn: 'Autumn',
} as const; // use const instead of enum to use Object.keys

export type Season = keyof typeof Seasons;
