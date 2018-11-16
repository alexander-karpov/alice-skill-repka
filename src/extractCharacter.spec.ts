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
        expect(char.noun.accusative).toEqual('котенка');
    });

    test('Прилагательное муж.', async () => {
        const char = await act('Белого котёнка');
        expect(char.adjectives).toHaveLength(1);
    });

    test('Прилагательное жен.', async () => {
        const char = await act('Чёрную кошечку');
        expect(char.adjectives).toHaveLength(1);
    });

    test('И - это не прилагательное.', async () => {
        const char = await act('И кошечку');
        expect(char.adjectives).toHaveLength(0);
    });

    test('Приводит прилагательное к роду существительного', async () => {
        const char = await act('Чёрную кошечку');
        expect(char.adjectives.map(w => w.nominative)).toEqual(['черная']);

        const char2 = await act('Мягкую черепашку');
        expect(char2.adjectives.map(w => w.nominative)).toEqual(['мягкая']);
    });

    beforeAll(() => {
        const spawned = spawnMystem();
        stemmer = spawned.stemmer;
        killStemmer = spawned.killStemmer;
    });

    afterAll(() => killStemmer());
});
