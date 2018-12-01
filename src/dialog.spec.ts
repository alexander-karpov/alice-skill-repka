import { mainDialog } from './dialog';
import { spawnMystem, Stemmer } from './stemmer';
import { SessionData, createSessionData } from './sessionData';

describe('Main dialog', () => {
    let killStemmer: () => void;
    let stemmer: Stemmer;
    let sessionData: SessionData;

    async function act(command: string, random100 = 0): Promise<string> {
        const {
            speech: { text }
        } = await mainDialog(command.toLowerCase().split(' '), sessionData, { stemmer, random100 });
        return text;
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
        expect(await act('Внучок')).toMatch('Внучок за богатыря');
        expect(await act('Царица')).toMatch('Царица за внучка');
        expect(await act('Лебедь')).toMatch('Лебедь за царицу');
        expect(await act('Врач')).toMatch('Врач за лебедя');
    });

    test('Приоритет вин. падежу', async () => {
        /**
         * внучк+а, а не вн+учка
         * Например дед позвал внучка
         */
        await act('');
        expect(await act('Внучка')).toMatch('Внучок за дедку');
    });

    test('Позвали репку', async () => {
        /**
         * внучк+а, а не вн+учка
         * Например дед позвал внучка
         */
        await act('');
        expect(await act('Репку')).toMatch('Репка сама себя не вытянет');
    });

    test('Специальная фраза для бабки', async () => {
        await act('');
        expect(await act('Бабку')).toMatch(/у тебя такие большие руки\?.+Бабка за дедку/);
    });

    test('Специальная фраза для кошек', async () => {
        await act('');
        expect(await act('кошку')).toMatch(/Прибежала кошка.*вцепилась в дедку/);
        expect(await act('кот')).toMatch(/Прибежал кот.*вцепился в кошку/);
    });

    test('Специальная фраза для мурки', async () => {
        await act('');
        expect(await act('мурку')).toMatch(/Прибежала кошка мурка/);
    });

    test('Отбрасывает неодушевленное специальной фразой', async () => {
        await act('');
        expect(await act('лопату')).toMatch(/звал дедка лопату.*не дозвался/);
        expect(await act('лопату', 1)).toMatch('Долго ждал он ответа, не дождался');
        expect(await act('лопату', 2)).toMatch('лопата имела: говорить она умела');
    });

    test('что ты умеешь / помощь', async () => {
        expect(await act('что ты умеешь')).toMatch('расскажу сказку про репку');
        expect(await act('помощь')).toMatch('расскажу сказку про репку');
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
        expect(await act('давай еще раз')).toMatch('осадил дед репку');

        expect(await act('мышку')).toMatch('вытянули репку');
        expect(await act('да пожалуйста')).toMatch('осадил дед репку');
    });

    test('Отказ от продолжения словом Не надо', async () => {
        await act('');
        await act('мышку');
        expect(await act('больше не надо пожалуйста')).toMatch('конец');
    });

    test('Повтор истории: отказ', async () => {
        await act('');
        expect(await act('мышку')).toMatch('вытянули репку');
        const {
            speech: { text },
            endSession
        } = await mainDialog('нет спасибо'.split(' '), sessionData, { stemmer, random100: 0 });

        expect(text).toMatch('конец');
        expect(endSession).toEqual(true);
    });

    beforeEach(() => {
        sessionData = createSessionData();
    });

    beforeAll(() => {
        const spawned = spawnMystem();
        stemmer = spawned.stemmer;
        killStemmer = spawned.killStemmer;
    });

    afterAll(() => killStemmer());
});
