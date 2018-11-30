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

    test('Классическая сказка: начало', async () => {
        expect(await act('')).toMatch('осадил дед репку');
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

    test('Мужской род зовет на помощь', async () => {
        await act('');
        expect(await act('Дракона')).toMatch('Позвал дракон...');
    });

    test('Женский род зовет на помощь', async () => {
        await act('');
        expect(await act('Бабку')).toMatch('Позвала бабка...');
    });

    test('Средний род зовет на помощь', async () => {
        await act('');
        expect(await act('Чудище')).toMatch('Позвало чудище...');
    });

    test('Сохраняет только героя в творительном падеже', async () => {
        await act('');
        expect(await act('Бутылка стола дракона')).toMatch('Дракон за дедку');
    });

    test('Предпочтение одушевленным', async () => {
        await act('');
        expect(await act('Серёжку')).toMatch('Позвал сережка');
    });

    test('Уникальная фраза на множ. число', async () => {
        await act('');
        expect(await act('котят')).toMatch('по одному');
    });

    test('Правильно склоняет фразу переспрашивания героя', async () => {
        await act('');
        await act('внука');
        expect(await act('ракета')).toMatch('Кого внук позвал');

        await act('Бабку');
        expect(await act('ракета')).toMatch('Кого бабка позвала');

        await act('чудище');
        expect(await act('ракета')).toMatch('Кого чудище позвало');
    });

    test('Принимает персонажа в именительном падеже', async () => {
        await act('');
        expect(await act('человек')).toMatch('Человек за дедку');
        expect(await act('богатырь')).toMatch('Богатырь за человека');
        expect(await act('Внучок')).toMatch('Внучка за богатыря');
        expect(await act('Цариса')).toMatch('Царица за внучку');
        expect(await act('Лебедь')).toMatch('Лебедь за царицу');
        expect(await act('Врач')).toMatch('Врач за лебедь');
    });

    test.only('Приоритет вин. падежу', async () => {
        /**
         * внучк+а, а не вн+учка
         * Например дед позвал внучка
         */
        await act('');
        expect(await act('Внучка')).toMatch('Внучок за дедку');
    });

    test.only('Позвали репку', async () => {
        /**
         * внучк+а, а не вн+учка
         * Например дед позвал внучка
         */
        await act('');
        expect(await act('Репку')).toMatch('Репка сама себя не вытянет');
    });

    test.only('Позвали бабку', async () => {
        /**
         * внучк+а, а не вн+учка
         * Например дед позвал внучка
         */
        await act('');
        expect(await act('Бабку')).toMatch(/у тебя такие большие руки\?.+Бабка за дедку/);
    });

    beforeEach(() => {
        sessionData = createSessionData();
    });

    beforeAll(() => {
        const spawned = spawnMystem();
        deps = { stemmer: spawned.stemmer, random100: 0 };
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

    test('что ты умеешь / помощь', async () => {
        expect(await act('что ты умеешь')).toMatch('расскажу вам сказку про репку');
    });

    test('что ты умеешь / помощь (в ходе повествования)', async () => {
        await act('');
        await act('котика');
        expect(await act('что ты умеешь')).toMatch('Кого котик позвал на помощь?');
        expect(await act('помощь')).toMatch('Кого котик позвал на помощь?');
    });

    test('Повтор истории: подтверждение', async () => {
        await act('');
        expect(await act('мышку')).toMatch('вытянули репку');
        expect(await act('да пожалуйста')).toMatch('осадил дед репку');

        expect(await act('мышку')).toMatch('вытянули репку');
        expect(await act('давай еще раз')).toMatch('осадил дед репку');
    });

    test('Повтор истории: отказ', async () => {
        await act('');
        expect(await act('мышку')).toMatch('вытянули репку');
        const { text, endSession } = await mainDialog(['нет спасибо не надо'], sessionData, deps);

        expect(text).toMatch('конец');
        expect(endSession).toEqual(true);
    });

    beforeEach(() => {
        sessionData = createSessionData();
    });

    beforeAll(() => {
        const spawned = spawnMystem();
        deps = { stemmer: spawned.stemmer, random100: 0 };
        killStemmer = spawned.killStemmer;
    });

    afterAll(() => killStemmer());
});
