import type { PackageJson } from 'type-fest';

/**
 * Type-checks an object to verify it looks like a node package.json file.
 * @param possible_package the possible package
 * @returns the same object, with the type to match
 * @throws {TypeError} when the object does not look like a package.json
 */
export function CheckNodePackage(
  possible_package: unknown,
  required_keys: (keyof PackageJson)[] = ['name'],
): PackageJson {
  for (const key of required_keys) {
    if (possible_package[key] == null) {
      throw new TypeError(
        `object is missing required key ${key}, and thus is not a package.json.`,
      );
    }
  }

  return possible_package as PackageJson;
}
