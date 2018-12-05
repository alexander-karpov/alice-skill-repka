import * as _ from 'lodash';

export type Selector<T, TResult> = (x: T) => TResult | undefined;
export type Maybe<T> = T | undefined;

/**
 * Определяет и возвращает включение последовательности в массив.
 * Последовательность задается массивом предикатов.
 * @param seq Где ищем
 * @param pattern Что ищем
 */
export function matchSeq<T, TResult>(
    seq: Maybe<T[]>,
    pattern: Selector<T, TResult>[]
): Maybe<TResult[]> {
    if (!seq) {
        return undefined;
    }

    if (!areLengthsCompatible(seq, pattern)) {
        return undefined;
    }

    for (let i = 0; i < seq.length - pattern.length + 1; i++) {
        if (startsWithf(seq, pattern, i)) {
            return seq.slice(i, i + pattern.length).map((v, i) => pattern[i](v) as TResult);
        }
    }

    return undefined;
}

function areLengthsCompatible<TItem, TResult>(seq: TItem[], pattern: Selector<TItem, TResult>[]) {
    return !_.isEmpty(seq) && !_.isEmpty(pattern) && pattern.length <= seq.length;
}

function startsWithf<T, TResult>(seq: T[], pattern: Selector<T, TResult>[], offset = 0) {
    if (offset + pattern.length > seq.length) {
        return false;
    }

    return pattern.every((p, i) => p(seq[i + offset]) !== undefined);
}
