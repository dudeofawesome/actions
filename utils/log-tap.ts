import { inspect } from 'node:util';

export function log_tap<T>(
  log: (data: string) => void = console.info,
  title: string | undefined = undefined,
  transformer: (value: T) => string = (v) => {
    if (v == null) {
      return v === null ? 'null' : 'undefined';
    } else if (['string', 'number'].includes(typeof v)) {
      return v.toString();
    } else if (typeof v === 'object' && 'toString' in v) {
      return inspect(v);
    } else {
      throw new TypeError(
        `Cannot cast logged data to string. Try a custom transformer`,
      );
    }
  },
): (value: T) => T {
  return (value: T): T => {
    log((title == null ? '' : `${title}: `) + transformer(value));
    return value;
  };
}
