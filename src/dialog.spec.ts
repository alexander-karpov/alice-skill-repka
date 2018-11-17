import { storyDialog, mainDialog, DialogDependencies } from './dialog';
import { spawnMystem } from './stemmer';
import { SessionData, createSessionData } from './sessionData';

describe('Story dialog', () => {
    let killStemmer: () => void;
    let deps: DialogDependencies;
    let sessionData: SessionData;

    async function act(command: string) {
        return storyDialog(command, sessionData, deps);
    }

    test('Классическая сказка: история', async () => {
        expect(await act('')).toMatch('Посадил дед репку');
    });

    test('Классическая сказка: история', async () => {
        await act('');
        await act('Бабку');
        await act('Внучку');
        await act('Жучку');
        const story = await act('Кошку');

        expect(story).toMatch('Кошка за жучку, жучка за внучку, внучка за бабку,');
        expect(story).toMatch('бабка за дедку, дедка за репку — тянут-потянут, вытянуть не могут.');
    });

    test('Классическая сказка: конец [позвали мышку]', async () => {
        await act('');
        await act('Бабку');
        const story = await act('Мышку');

        expect(story).toMatch(
            'Мышка за бабку, бабка за дедку, дедка за репку — тянут-потянут, — вытянули репку!'
        );
    });

    test('Мужской род зовет на помошь', async () => {
        await act('');
        expect(await act('Дракона')).toMatch('Позвал дракон...');
    });

    test('Женский род зовет на помошь', async () => {
        await act('');
        expect(await act('Бабку')).toMatch('Позвала бабка...');
    });

    test('Средний род зовет на помошь', async () => {
        await act('');
        expect(await act('Чудище')).toMatch('Позвало чудище...');
    });

    test('Сохраняет только героя в творительном падеже', async () => {
        await act('');
        expect(await act('Бутылка стола дракона')).toMatch('Дракон за дедку');
    });

    test('Из двух предпочитает последнего', async () => {
        await act('');
        expect(await act('Дракона и бабку')).toMatch('Позвала бабка...');
    });

    test('Предпочтение одушевленным', async () => {
        await act('');
        expect(await act('Серёжку')).toMatch('Позвал сережка');
    });

    test('Не пропускает множественное число', async () => {
        await act('');
        expect(await act('Братьев')).toMatch('Позвал дедка...');
    });

    test('Сохраняет сказуемое', async () => {
        await act('');
        expect(await act('маленького котёнка')).toMatch('Маленький котенок за дедку');
        expect(await act('Старую бабку')).toMatch('Старая бабка за маленького котенка');
    });

    test('Не добавляет сказуемое, если оно совпадает с подлежащим', async () => {
        await act('');
        expect(await act('Маленького')).toMatch('Маленький за дедку');
    });

    beforeEach(() => {
        sessionData = createSessionData();
    });

    beforeAll(() => {
        const spawned = spawnMystem();
        deps = { stemmer: spawned.stemmer };
        killStemmer = spawned.killStemmer;
    });

    afterAll(() => killStemmer());
});

describe('Main dialog', () => {
    let killStemmer: () => void;
    let deps: DialogDependencies;
    let sessionData: SessionData;

    async function act(command: string): Promise<string> {
        const { text } = await mainDialog(command.split(' '), sessionData, deps);
        return text;
    }

    test('что ты умеешь / помошь', async () => {
        expect(await act('что ты умеешь')).toMatch('рассказываю сказку про репку');
    });

    test('что ты умеешь / помошь (в ходе повествования)', async () => {
        await act('');
        await act('котика');
        expect(await act('что ты умеешь')).toMatch('Кого позвал котик на помощь?');
    });

    beforeEach(() => {
        sessionData = createSessionData();
    });

    beforeAll(() => {
        const spawned = spawnMystem();
        deps = { stemmer: spawned.stemmer };
        killStemmer = spawned.killStemmer;
    });

    afterAll(() => killStemmer());
});
