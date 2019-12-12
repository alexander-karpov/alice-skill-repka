import { binarySearch } from './binarySearch';
//@ts-ignore
const rhymes: string[] = require('./rhymes.json');

describe('binarySearch', () => {
    test('Находит слова в индексе ударений', async () => {
        const еnding = "`эт'";

        const item = binarySearch(rhymes, record => {
            const key = record.slice(0, record.indexOf(','));
            return еnding === key ? 0 : key > еnding ? 1 : -1;
        });

        expect(rhymes.find(r => r.startsWith(еnding))).toMatch("`эт',кеть,медь,сеть");
        expect(item).toMatch("`эт',кеть,медь,сеть");
    });
});
