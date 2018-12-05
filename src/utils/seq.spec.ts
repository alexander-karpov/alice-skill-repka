import { matchSeq } from './seq';

describe('match', () => {
    test('Undefined при несовместимых длинах', async () => {
        const seq = [1, 2];
        const pattern = [eq(1), eq(2), eq(3)];

        expect(matchSeq(seq, pattern)).toBeUndefined();
    });

    test('Undefined при попадании части в начале', async () => {
        const seq = [1, 2, 3, 4, 5];
        const pattern = [eq(0), eq(1), eq(2)];

        expect(matchSeq(seq, pattern)).toBeUndefined();
    });

    test('Undefined при попадании части в конце', async () => {
        const seq = [1, 2, 3, 4, 5];
        const pattern = [eq(4), eq(5), eq(6)];

        expect(matchSeq(seq, pattern)).toBeUndefined();
    });

    test('OK когда в начале', async () => {
        const seq = [1, 2, 3, 4, 5];
        const pattern = [eq(1), eq(2), eq(3)];

        expect(matchSeq(seq, pattern)).toEqual([1, 2, 3]);
    });

    test('OK когда в середине', async () => {
        const seq = [1, 2, 3, 4, 5];
        const pattern = [eq(2), eq(3), eq(4)];

        expect(matchSeq(seq, pattern)).toEqual([2, 3, 4]);
    });

    test('OK когда в конце', async () => {
        const seq = [1, 2, 3, 4, 5];
        const pattern = [eq(3), eq(4), eq(5)];

        expect(matchSeq(seq, pattern)).toEqual([3, 4, 5]);
    });

    test('OK когда один в начале', async () => {
        const seq = [1, 2, 3, 4, 5];
        const pattern = [eq(1)];

        expect(matchSeq(seq, pattern)).toEqual([1]);
    });

    test('OK когда один в середине', async () => {
        const seq = [1, 2, 3, 4, 5];
        const pattern = [eq(3)];

        expect(matchSeq(seq, pattern)).toEqual([3]);
    });

    test('OK когда один в конце', async () => {
        const seq = [1, 2, 3, 4, 5];
        const pattern = [eq(5)];

        expect(matchSeq(seq, pattern)).toEqual([5]);
    });

    function eq<T>(value: T) {
        return (x: T) => (x === value ? x : undefined);
    }
});
