import { extractCharacter } from './extractCharacter';
import { spawnMystem, Stemmer } from './stemmer';
import { Character } from './character';

describe('Extract character', () => {
    let killStemmer: () => void;
    let stemmer: Stemmer;

    async function act(command: string) {
        const char = extractCharacter(await stemmer(command));

        expect(char).toBeTruthy();
        return char as Character;
    }

    test('Всегда удаляет Ё (стеммер её удаляет)', async () => {
        const char = await act('Котёнка');
        expect(char.subject.accusative).toEqual('котенка');
    });

    test('Прилагательное муж.', async () => {
        const char = await act('Белого котёнка');
        expect(char.attributes).toHaveLength(1);
    });

    test('Прилагательное жен.', async () => {
        const char = await act('Чёрную кошечку');
        expect(char.attributes).toHaveLength(1);
    });

    test('И - это не прилагательное.', async () => {
        const char = await act('И кошечку');
        expect(char.attributes).toHaveLength(0);
    });

    test('Приводит прилагательное к роду существительного', async () => {
        const char = await act('Чёрную кошечку');
        expect(char.attributes.map(w => w.nominative)).toEqual(['черная']);

        const char2 = await act('Мягкую черепашку');
        expect(char2.attributes.map(w => w.nominative)).toEqual(['мягкая']);

        const char3 = await act('Страшное чудище');
        expect(char3.attributes.map(w => w.nominative)).toEqual(['страшное']);
    });

    beforeAll(() => {
        const spawned = spawnMystem();
        stemmer = spawned.stemmer;
        killStemmer = spawned.killStemmer;
    });

    afterAll(() => killStemmer());
});
