import { spawnMystem, Stemmer } from './stemmer';
import { extractSAnim, extractASAnim2 } from './entities';

describe('Entities', () => {
    //#region tests infrastructure
    let killStemmer: () => void;
    let stemmer: Stemmer;

    beforeAll(() => {
        const spawned = spawnMystem();
        stemmer = spawned.stemmer;
        killStemmer = spawned.killStemmer;
    });

    afterAll(() => killStemmer());
    //#endregion

    describe('extractASAnim2', () => {
        test('Распознает множ. число', async () => {
            const tokens = await stemmer('Вот они наши милые кони скачут по поляне');
            const entity = extractASAnim2(tokens);

            if (!entity) throw new Error('Entity is undefined.');
            expect(entity).toHaveLength(2);
            expect(entity[0].lex).toEqual('милый');
            expect(entity[1].lex).toEqual('конь');
        });

        test('Распознает един. число', async () => {
            const tokens = await stemmer('Вот он наш милый конь скачит по поляне');
            const entity = extractASAnim2(tokens);

            if (!entity) throw new Error('Entity is undefined.');
            expect(entity).toHaveLength(2);
            expect(entity[0].lex).toEqual('милый');
            expect(entity[1].lex).toEqual('конь');
        });

        test('Не распоздает смешенное', async () => {
            const entity = extractASAnim2(await stemmer('Вот он наш милые конь скачит по поляне'));
            expect(entity).toBeUndefined();
        });
    });

    describe('extractSAnim', () => {
        test('Распознает вин. падеж', async () => {
            const entity = extractSAnim(await stemmer('Вот позвал дед мальчика'));

            if (!entity) throw new Error('Entity is undefined.');
            expect(entity.lex).toEqual('мальчик');
        });

        test('Распознает дат. падеж', async () => {
            const entity = extractSAnim(await stemmer('мальчику'));

            if (!entity) throw new Error('Entity is undefined.');
            expect(entity.lex).toEqual('мальчик');
        });

        test('Распознает льва', async () => {
            const entity = extractSAnim(await stemmer('лев'));

            if (!entity) throw new Error('Entity is undefined.');
            expect(entity.lex).toEqual('лев');
        });
    });
});
