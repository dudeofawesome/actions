import { Promisable } from 'type-fest';

export async function filter<T>(
  array: T[],
  predicate: (value: T) => Promisable<boolean>,
): Promise<T[]> {
  const exclude = Symbol('exclude');
  return (
    await Promise.all(
      array.map(async (item) => ((await predicate(item)) ? item : exclude)),
    )
  ).filter((i): i is Awaited<T> => i !== exclude);
}
