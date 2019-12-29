import { Morpher } from './Morpher';

describe('Morpher', () => {
    test('Предлагает рифмы', async () => {
        // Ищи все тесты в истории коммитов по слову Morpher.spec
        expect(Morpher.animMascNomnToAccs('юнец')).toBe('юнца');
        expect(Morpher.animFemnNomnToAccs('радонежская')).toBe('радонежскую');
        expect(Morpher.animMascFemnNomnToAccs('бебешка')).toBe('бебешку');
    });
});
