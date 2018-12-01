import * as _ from 'lodash';

/**
 * Определяет включение одного массива в другой
 * @param seq Где ищем
 * @param pattern Что ищем
 */
export function includesSeq<T>(seq: T[], pattern: T[]) {
    if (_.isEmpty(seq) || _.isEmpty(pattern) || pattern.length > seq.length) {
        return false;
    }

    return seq.some((_value, i) => startsWith(seq, pattern, i));
}

function startsWith<T>(seq: T[], pattern: T[], offset = 0) {
    if (offset + pattern.length > seq.length) {
        return false;
    }

    return pattern.every((value, i) => value === seq[i + offset]);
}
