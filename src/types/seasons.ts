export const Seasons = {
  Winter: 'Winter',
  Spring: 'Spring',
  Summer: 'Summer',
  Fall: 'Fall',
} as const; // use const instead of enum to use Object.keys

export type Season = keyof typeof Seasons;

export const AllSeasons = Object.keys(Seasons) as Season[];
