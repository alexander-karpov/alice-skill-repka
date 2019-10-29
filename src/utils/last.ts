export function last<T>(array: readonly T[]): T | undefined {
    return array[array.length - 1];
}
