export const formatNumber = (
  number: number,
  separator: string = "'",
): string => {
  const [integerPart, decimalPart] = number.toString().split('.');

  const formattedNumber = integerPart
    .split('')
    .reverse()
    .reduce((acc, curr, idx) => {
      if (curr === '-' || idx % 3 !== 0) {
        return `${acc}${curr}`;
      }

      return `${acc}${separator}${curr}`;
    })
    .split('')
    .reverse()
    .join('');

  return decimalPart ? `${formattedNumber}.${decimalPart}` : formattedNumber;
};

export const formatFloat = (number: number): number =>
  Number.parseFloat(number.toFixed(1));
