export type NonEmptyArray<T> = readonly [T, ...T[]];
export const CreateNonEmptyArray = <T>(arr: T[]): NonEmptyArray<T> => {
  const [first, ...rest] = arr;
  if (!first) {
    throw new Error('Cannot create a NonEmptyArray from an empy array!');
  }

  return [first, ...rest];
};

/**
 * Creates a new array with the element at the specified index updated to a new value.
 * This function does not modify the original array; it returns a new array with the changes.
 *
 * @template T The type of elements in the array.
 * @param array The original array.
 * @param index The index of the element to update.
 * @param newValue The new value to set at the specified index.
 * @returns A new array with the updated element.
 * @throws {Error} If the index is out of range (less than 0 or greater than or equal to the array length).
 */
export const updateArrayElement = <T>(
  array: T[] | NonEmptyArray<T>,
  index: number,
  newValue: T,
): T[] => {
  if (index < 0 || index >= array.length) {
    throw new Error('Index out of bounds');
  }

  // Create a new array with the updated element
  return [...array.slice(0, index), newValue, ...array.slice(index + 1)];
};
