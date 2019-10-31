export function last<T>(array: readonly [T] | readonly [T, T] | readonly [T, T, T]): T;
export function last<T>(array: readonly T[]): T | undefined;

export function last<T>(array: readonly T[]): T | undefined {
    return array[array.length - 1];
}
