import * as _ from 'lodash';

export type Selector<T, TResult> = (x: T) => TResult | undefined;
export type Predicate<T> = (x: T) => boolean;
export type Maybe<T> = T | undefined;

/**
 * Определяет и возвращает включение последовательности в массив.
 * Последовательность задается массивом предикатов.
 * @param seq Где ищем
 * @param pattern Что ищем
 */
export function matchSeq<T, TResult>(
    seq: Maybe<T[]>,
    pattern: Selector<T, TResult>[],
    separator: Predicate<T> = () => false
): Maybe<TResult[]> {
    if (!seq) {
        return undefined;
    }

    const withoutSpaces = _.filter(seq, item => !separator(item));

    if (!areLengthsCompatible(withoutSpaces, pattern)) {
        return undefined;
    }

    for (let i = 0; i < withoutSpaces.length - pattern.length + 1; i++) {
        if (startsWithf(withoutSpaces, pattern, i)) {
            return withoutSpaces
                .slice(i, i + pattern.length)
                .map((v, i) => pattern[i](v) as TResult);
        }
    }

    return undefined;
}

export function eq<T>(value: T): Selector<T, T> {
    return (x: T) => (x === value ? x : undefined);
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
