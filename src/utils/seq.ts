import { Predicate } from 'src/core';

/**
 * Находит и возвращает включение последовательности в массив.
 * Последовательность задается массивом предикатов.
 * @param seq Где ищем
 * @param pattern Что ищем
 */
export function findSeq<T>(seq: T[], pattern: Predicate<T>[]): T[] | undefined {
    if (!seq || !seq.length || !pattern.length) {
        return undefined;
    }

    if (pattern.length > seq.length) {
        return undefined;
    }

    for (let i = 0; i < seq.length - pattern.length + 1; i++) {
        if (startsWith(seq, pattern, i)) {
            return seq.slice(i, i + pattern.length);
        }
    }

    return undefined;
}

function startsWith<T>(seq: T[], pattern: Predicate<T>[], offset = 0) {
    if (offset + pattern.length > seq.length) {
        return false;
    }

    return pattern.every((p, i) => p(seq[i + offset]));
}
