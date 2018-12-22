import * as _ from 'lodash';
import { mainDialog } from './dialog';
import { spawnMystem, Stemmer } from './stemmer';
import { SessionData, createSessionData } from './sessionData';

describe('Main dialog', () => {
    test('Классическая сказка: начало', async () => {
        expect(await act('')).toMatch('осадил дед репку');
    });

    test('Классическая сказка: история', async () => {
        act('');
        act('Бабку');
        act('Внучку');
        act('Жучку');
        const story = await act('Кошку');

        expect(story).toMatch('Кошка за жучку, жучка за внучку, внучка за бабку,');
        expect(story).toMatch('бабка за дедку, дедка за репку. Тянут-потянут — вытянуть не могут.');
    });

    test('Классическая сказка: конец [позвали мышку]', async () => {
        act('');
        act('Бабку');
        const story = await act('Мышку');

        expect(story).toMatch(
            'Мышка за бабку, бабка за дедку, дедка за репку. Тянут-потянут — вытянули репку!',
        );
    });

    test('Мужской род зовет на помощь', async () => {
        act('');
        expect(await act('Дракона')).toMatch('Кого позвал дракон');
    });

    test('Женский род зовет на помощь', async () => {
        act('');
        expect(await act('Бабку')).toMatch('Кого позвала бабка');
    });

    test('Средний род зовет на помощь', async () => {
        act('');
        expect(await act('Чудище')).toMatch('Кого позвало чудище');
    });

    test('Сохраняет только героя в творительном падеже', async () => {
        act('');
        expect(await act('Бутылка стола дракона')).toMatch('Дракон за дедку');
    });

    test('Предпочтение одушевленным', async () => {
        act('');
        expect(await act('Серёжку')).toMatch('Кого позвал сережка');
    });

    test('Правильно склоняет фразу переспрашивания героя', async () => {
        act('');
        act('внука');
        expect(await act('ракета')).toMatch('Кого позвал внук');

        act('Бабку');
        expect(await act('ракета')).toMatch('Кого позвала бабка');

        act('чудище');
        expect(await act('ракета')).toMatch('Кого позвало чудище');
    });

    test('Принимает персонажа в именительном падеже', async () => {
        act('');
        expect(await act('человек')).toMatch('Человек за дедку');
        expect(await act('богатырь')).toMatch('Богатырь за человека');
        expect(await act('Внучок')).toMatch('Внучок за богатыря');
        expect(await act('Царица')).toMatch('Царица за внучка');
        expect(await act('Лебедь')).toMatch('Лебедь за царицу');
        // TODO Лебедь распознается как фамилия жен. в вин. падеже
        // expect(await act('Врач')).toMatch('Врач за лебедя');
    });

    test('Приоритет вин. падежу', async () => {
        /**
         * внучк+а, а не вн+учка
         * Например дед позвал внучка
         */
        act('');
        expect(await act('Внучка')).toMatch('Внучок за дедку');
    });

    test('Специальная фраза для рыбки', async () => {
        act('');
        expect(await tts('золотую рыбку из сказки Пушкина')).toMatch(
            /кликать золотую рыбку.*приплыла к нему рыбка, спросила/,
        );

        act('кошку');
        expect(await act('рыбку из сказки Пушкина')).toMatch('стала она кликать');
    });

    test('Специальная фраза для кошек', async () => {
        act('');
        expect(await tts('черную кошку')).toMatch(/Прибежала черная кошка.*вцепилась в дедку/);
        expect(await tts('кот мартоскин')).toMatch(/Прибежал кот.*вцепился в/);
    });

    test('Специальная фраза для мурки', async () => {
        act('');
        expect(await tts('мурку')).toMatch(/Прибежала кошка мурка/);
    });

    test('Отбрасывает неодушевленное специальной фразой', async () => {
        act('');
        expect(await act('лопату')).toMatch(/звал дедка лопату.*не дозвался/);
        expect(await act('ведро')).toMatch(/звал дедка ведро.*не дозвался/);
        expect(await act('чайник')).toMatch(/звал дедка чайник.*не дозвался/);
        expect(await act('окно')).toMatch(/звал дедка окно.*не дозвался/);
    });

    test('что ты умеешь / помощь', async () => {
        expect(await act('что ты умеешь')).toMatch('вместе сочиним сказку');
        expect(await act('помощь')).toMatch('вместе сочиним сказку');
    });

    test('что ты умеешь / помощь (в ходе повествования)', async () => {
        act('');
        act('котика');
        expect(await act('что ты умеешь')).toMatch('Кого позвал котик');
        expect(await act('помощь')).toMatch('Кого позвал котик');
    });

    test('Повтор истории: подтверждение', async () => {
        act('');
        expect(await act('мышку')).toMatch('вытянули репку');
        expect(await act('давай еще раз')).toMatch('осадил дед репку');

        expect(await act('черную мышку')).toMatch('вытянули репку');
        expect(await act('да пожалуйста')).toMatch('Посадил дед репку');
    });

    test('Черный город: начало', async () => {
        act('');
        await act('мышку');
        expect(await act('давай еще раз')).toMatch('В одном чёрном');
    });

    test('Черный город: правильный персонаж', async () => {
        act('');
        await act('мышку');
        await act('давай еще раз');
        expect(await act('Человеческий котика')).toMatch('Человеческий котик за дедку');
    });

    test('Черный город: неправильный персонаж', async () => {
        act('');
        await act('мышку');
        await act('давай еще раз');
        expect(await act('Котика')).toMatch('Котик начинается на букву "К".');
    });

    test('Отказ от продолжения словом Не надо', async () => {
        act('');
        // FIXME: Если убрать await, тест упадет. Понять, почему.
        await act('мышку');
        expect(await act('больше не надо пожалуйста')).toMatch('конец');
    });

    test('Позвали лошадь (регрессия)', async () => {
        act('');
        expect(await act('лошадь')).toMatch('Лошадь за дедку');
        expect(await act('лошадь')).toMatch('Лошадь за лошадь');
    });

    test('Для имен неопред. рода выбирается мужской', async () => {
        act('');
        expect(await act('сашу')).toMatch('Кого позвал саша');
    });

    test('Принимает имя-фамилию', async () => {
        act('');
        expect(await act('александра карпова')).toMatch('Александр Карпов за дедку,');
        expect(await act('ирина карпова')).toMatch('Ирина Карпова за Александра Карпова,');
        expect(await act('владимир путин')).toMatch('Владимир Путин за Ирину Карпову,');
        expect(await act('гарри поттер')).toMatch('Гарри Поттер за Владимира Путина,');
        expect(await act('фёдор емельяненко')).toMatch('Федор Емельяненко за Гарри Поттера,');
        expect(await act('аллу пугачёву')).toMatch('Алла Пугачева за Федора Емельяненко,');
    });

    test('Принимает прилагательное-существительное', async () => {
        act('');
        expect(await act('железного человека')).toMatch('Железный человек за дедку');
        expect(await act('маленькую кошечку')).toMatch('Маленькая кошечка за железного человека,');
        expect(await act('черную кошку')).toMatch('Черная кошка за маленькую кошечку,');
        expect(await act('летний зайчик')).toMatch('Летний зайчик за черную кошку,');
        expect(await act('летнюю пчелку')).toMatch('Летняя пчелка за летнего зайчика,');
        expect(await act('зверя')).toMatch('Зверь за летнюю пчелку,');
    });

    test('Любого персонажа вин. падежа предпочитает Имени-Фамилии им. падежа', async () => {
        act('');
        expect(await act('позвал Вася Пупкин котика')).toMatch('Кого позвал котик');
    });

    test('Распознает Имя-Фамилия когда имя неопределенного пола', async () => {
        act('');
        expect(await act('Саша Карпов')).toMatch('Саша Карпов за дедку');
    });

    test('Очень короткие слова в вин. падеже.', async () => {
        act('');
        expect(await act('пса')).toMatch('Пес за дедку');
        expect(await act('льва')).toMatch('Лев за пса');
        expect(await act('котика')).toMatch('Котик за льва');

        expect(await act('пес')).toMatch('Пес за котика');
        expect(await act('лев')).toMatch('Лев за пса');
        expect(await act('котик')).toMatch('Котик за льва');
    });

    test('Повтор истории: отказ', async () => {
        act('');
        expect(await act('мышку')).toMatch('вытянули репку');
        const {
            speech: { text },
            endSession,
        } = await mainDialog('нет спасибо'.split(' '), sessionData, { stemmer, random100: 0 });

        expect(text).toMatch('конец');
        expect(endSession).toEqual(true);
    });

    test('Проверяем, обеспечивается ли порядок если не дожидаться обработки', async () => {
        act('');
        act('Бабку');
        act('Внучку');
        act('Жучку');
        const story = await act('Кошку');

        expect(story).toMatch('Кошка за жучку, жучка за внучку, внучка за бабку,');
        expect(story).toMatch('бабка за дедку, дедка за репку. Тянут-потянут — вытянуть не могут.');
    });

    test('Спецфраза для жучки', async () => {
        act('');
        expect(await tts('жучку')).toMatch('Прибежала жучка');
    });

    test('Позвали буратино, пиноккио', async () => {
        act('');
        expect(await act('буратино')).toMatch('Буратино за дедку');
        expect(await act('пиноккио')).toMatch('Пиноккио за буратино,');
        expect(await act('котик')).toMatch('Котик за пиноккио,');
    });

    test('Распознает множ. число как ед.', async () => {
        act('');
        expect(await act('кошек')).toMatch('Кошка за дедку');
        expect(await act('котята')).toMatch('Котенок за кошку');
    });

    test('Позвали осла', async () => {
        act('');
        expect(await act('осла')).toMatch('Осел за дедку');
        expect(await act('котика')).toMatch('Котик за осла,');
    });

    test('Позвали гонца', async () => {
        act('');
        expect(await act('гонца')).toMatch('Гонец за дедку');
        expect(await act('котика')).toMatch('Котик за гонца,');
    });

    test('Позвали бобра', async () => {
        act('');
        expect(await act('бобра')).toMatch('Бобер за дедку');
        expect(await act('котика')).toMatch('Котик за бобра,');
    });

    test('Чёрный ворон не заменяется на ворону', async () => {
        act('');
        expect(await tts('чёрного ворона')).toMatch(/Прилетел черный ворон .*черный ворон за/i);
        expect(await tts('чёрный ворон')).toMatch(/Прилетел черный ворон .*черный ворон за/i);
    });

    test('Не склоняет неод. сущности', async () => {
        act('');
        expect(await tts('замок')).toMatch(/звал дедка замок/i);
    });

    test('Правильно склоняет милых конец', async () => {
        act('');
        expect(await tts('милые кони')).toMatch(/милый конь за дедку/i);
        expect(await tts('милые кони')).toMatch(/милый конь за милого коня/i);
    });

    test('В конце концов распоздавать сущ. в любом падеже', async () => {
        act('');
        expect(await tts('мальчику')).toMatch(/мальчик за дедку/i);
    });

    test('Чернила - неодущевленная сущность', async () => {
        act('');
        expect(await tts('чернила')).toMatch(/звал дедка чернила/i);
    });

    test('Распознает Чиполлино', async () => {
        act('');
        expect(await act('Чиполлино')).toMatch(/чиполлино за дедку/i);
    });

    //#region tests infrastructure
    let killStemmer: () => void;
    let stemmer: Stemmer;
    let sessionData: SessionData;

    async function act(command: string, random100 = 0): Promise<string> {
        const {
            speech: { text },
        } = await mainDialog(command.toLowerCase().split(' '), sessionData, { stemmer, random100 });
        return text;
    }

    async function tts(command: string, random100 = 0): Promise<string> {
        const {
            speech: { tts },
        } = await mainDialog(command.toLowerCase().split(' '), sessionData, { stemmer, random100 });
        return tts;
    }

    beforeEach(() => {
        sessionData = createSessionData();
    });

    beforeAll(() => {
        const spawned = spawnMystem();
        stemmer = spawned.stemmer;
        killStemmer = spawned.killStemmer;
    });

    afterAll(() => killStemmer());
    //#endregion
});
