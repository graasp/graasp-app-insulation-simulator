export type NonEmptyArray<T> = [T, ...T[]];
export const CreateNonEmptyArray = <T>(arr: T[]): NonEmptyArray<T> => {
  const [first, ...rest] = arr;
  if (!first) {
    throw new Error('Cannot create a NonEmptyArray from an empy array!');
  }

  return [first, ...rest];
};
