export interface Options {
  delimiter?: string;
  trim?: boolean;
}
export function ParseStringToArray(
  input: string | undefined,
  { delimiter = '\n', trim = true }: Options = {},
): string[] {
  if (input == null || (trim ? input.trim() : input).length === 0) return [];
  else return input.split(delimiter).map((v) => (trim ? v.trim() : v));
}
