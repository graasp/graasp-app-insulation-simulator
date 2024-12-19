const dateDiffInDays = (from: Date, to: Date): number => {
  const diffInMs = to.getTime() - from.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diffInMs / oneDay);
};

export const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

export const getDayOfYear = (date: Date): number => {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  return dateDiffInDays(startOfYear, date);
};
