import { dialog, DialogContext } from './dialog';
import { spawnMystem, Stemmer } from './stemmer';

let stemmer: Stemmer;
let killStemmer: () => void;
let ctx: DialogContext;

test('Классическая сказка: история', async () => {
    expect(await dialog('', ctx)).toMatch('Посадил дед репку');
});

test('Классическая сказка: история', async () => {
    await dialog('', ctx);
    await dialog('Бабку', ctx);
    await dialog('Внучку', ctx);
    await dialog('Жучку', ctx);
    const story = await dialog('Кошку', ctx);

    expect(story).toMatch('Кошка за жучку, жучка за внучку, внучка за бабку,');
    expect(story).toMatch('бабка за дедку, дедка за репку — тянут-потянут, вытянуть не могут.');
});

test('Классическая сказка: конец [позвали мышку]', async () => {
    await dialog('', ctx);
    await dialog('Бабку', ctx);
    const story = await dialog('Мышку', ctx);

    expect(story).toMatch(
        'Мышка за бабку, бабка за дедку, дедка за репку — тянут-потянут, — вытянули репку!'
    );
});

test('Повторное начало истории', async () => {
    await dialog('', ctx);
    expect(await dialog('Мышку', ctx)).toMatch('— вытянули репку!');
    expect(await dialog('Да', ctx)).toMatch('Посадил дед репку');
});

test('Мужской род зовет на помошь', async () => {
    await dialog('', ctx);
    expect(await dialog('Дракона', ctx)).toMatch('Позвал дракон...');
});

test('Женский род зовет на помошь', async () => {
    await dialog('', ctx);
    expect(await dialog('Бабку', ctx)).toMatch('Позвала бабка...');
});

test('Средний род зовет на помошь', async () => {
    await dialog('', ctx);
    expect(await dialog('Чудище', ctx)).toMatch('Позвало чудище...');
});

test('Сохраняет только героя в творительном падеже', async () => {
    await dialog('', ctx);
    expect(await dialog('Бутылка стола дракона', ctx)).toMatch('Дракон за дедку');
});

test('Из двух предпочитает последнего', async () => {
    await dialog('', ctx);
    expect(await dialog('Дракона и бабку', ctx)).toMatch('Позвала бабка...');
});

test('Предпочтение одушевленным', async () => {
    await dialog('', ctx);
    expect(await dialog('Серёжку', ctx)).toMatch('Позвал сережка');
});

test('Не пропускает множественное число', async () => {
    await dialog('', ctx);
    expect(await dialog('Братьев', ctx)).toMatch('Позвал дедка...');
});

test('Сохраняет сказуемое', async () => {
    await dialog('', ctx);
    expect(await dialog('Маленького котёнка', ctx)).toMatch('Маленький котенок за дедку');
});

test('Не добавляет сказуемое, если оно совпадает с подлежащим', async () => {
    await dialog('', ctx);
    expect(await dialog('Маленького', ctx)).toMatch('Маленький за дедку');
});

beforeEach(() => {
    ctx = { stemmer, characters: [] };
});

beforeAll(() => {
    const spawned = spawnMystem();
    stemmer = spawned.stemmer;
    killStemmer = spawned.killStemmer;
});

afterAll(() => killStemmer());
