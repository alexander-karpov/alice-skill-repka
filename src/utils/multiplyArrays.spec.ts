import { multiplyArrays } from './multiplyArrays';

describe('multiplyArrays', () => {
    test('Перемножает массив', async () => {
        const production = multiplyArrays(['маша', 'махать'], ['сталь', 'становиться']);

        expect(production[0]).toEqual(['маша', 'сталь']);
        expect(production[1]).toEqual(['маша', 'становиться']);
        expect(production[2]).toEqual(['махать', 'сталь']);
        expect(production[3]).toEqual(['махать', 'становиться']);
        expect(production[4]).toBeUndefined();
    });
});
