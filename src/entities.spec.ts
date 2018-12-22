import { spawnMystem, Stemmer } from './stemmer';
import { extractASAnim } from './entities';
import { selectionLexeme } from './tokens';

describe('Entities', () => {
    let killStemmer: () => void;
    let stemmer: Stemmer;

    describe('extractASAnim', () => {
        test('Распознает множ. число', async () => {
            const tokens = await stemmer('Вот они наши милые кони скачут по поляне');
            const entity = extractASAnim(tokens);

            if (!entity) throw new Error('Entity is undefined.');
            expect(entity).toHaveLength(2);
            expect(selectionLexeme(entity[0]).lex).toEqual('милый');
            expect(selectionLexeme(entity[1]).lex).toEqual('конь');
        });

        test('Распознает един. число', async () => {
            const tokens = await stemmer('Вот он наш милый конь скачит по поляне');
            const entity = extractASAnim(tokens);

            if (!entity) throw new Error('Entity is undefined.');
            expect(entity).toHaveLength(2);
            expect(selectionLexeme(entity[0]).lex).toEqual('милый');
            expect(selectionLexeme(entity[1]).lex).toEqual('конь');
        });

        test('Не распоздает смешенное', async () => {
            const tokens = await stemmer('Вот он наш милые конь скачит по поляне');
            const entity = extractASAnim(tokens);

            expect(entity).toBeUndefined();
        });
    });

    beforeAll(() => {
        const spawned = spawnMystem();
        stemmer = spawned.stemmer;
        killStemmer = spawned.killStemmer;
    });

    afterAll(() => killStemmer());
});
