/**
 *
 * @param list Отсортированный список
 * @param compare Фукнция сравнения текущего значения с искомым
 */
export function binarySearch<T>(list: T[], compare: (item: T) => number): T | undefined {
    let low = 0;
    let high = list.length - 1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const guess = list[mid];

        if (compare(guess) === 0) {
            return guess;
        }

        if (compare(guess) > 0) {
            high = mid - 1;
        } else {
            low = mid + 1;
        }

        if (low > high) {
            return undefined;
        }
    }

    return undefined;
}
