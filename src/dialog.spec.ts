import { dialog, DialogContext } from './dialog';
import { spawnMystem, Stemmer } from './stemmer';

let stemmer: Stemmer;
let killStemmer: () => void;
let ctx: DialogContext;

test('Посадил дед...', async () => {
    expect(await dialog('', ctx))
        .toMatch('Посадил дед репку');
});

test('Бабк[а] за дедку', async () => {
    await dialog('', ctx)

    expect(await dialog('Бабку', ctx))
        .toMatch('Бабка за дедку');
});

test('Внучка за бабку', async () => {
    await dialog('', ctx)
    await dialog('Бабку', ctx)

    expect(await dialog('Внучку', ctx))
        .toMatch('Внучка за бабку');
});

test('[В]нучка за бабку[, ]бабка за дедку, дедка за репку [—]', async () => {
    await dialog('', ctx)
    await dialog('Бабку', ctx)

    expect(await dialog('Внучку', ctx))
        .toMatch('Внучка за бабку, бабка за дедку, дедка за репку — ');
});

beforeEach(() => {
    ctx = { stemmer, persons: [] };
})

beforeAll(() => {
    const spawned = spawnMystem();
    stemmer = spawned.stemmer;
    killStemmer = spawned.killStemmer;
});

afterAll(() => killStemmer());
