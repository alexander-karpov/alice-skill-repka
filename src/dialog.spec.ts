import { mainDialog, DialogResult } from './dialog';
import { Stemmer } from './Stemmer';
import { Session } from './Session';
import { Event } from './Event';
import { EventsCollector } from './EventsCollector';
import { WebhookRequest } from './server';
import { SceneButton } from './scene';
import { CachingStemmer } from './CachingStemmer';
import { MystemStemmer } from './MystemStemmer';
import { DumpingStemmer } from './DumpingStemmer';

describe('Main dialog', () => {
    test('Классическая сказка: начало', async () => {
        expect(await text('')).toMatch('осадил дед репку');
    });

    test('Классическая сказка: история', async () => {
        await text('');
        await text('Бабку');
        await text('Внучку');
        await text('Жучку');
        const story = await text('Кошку');

        expect(story).toMatch('Кошка 🐱 за жучку, жучка 🐶 за внучку, внучка 👧 за бабку,');
        expect(story).toMatch(
            'бабка 👵 за дедку, дедка 👴 за репку. Тянут-потянут — вытянуть не могут.'
        );
    });

    test('Классическая сказка: конец [позвали мышку]', async () => {
        await text('');
        await text('Бабку');
        const story = await text('Мышку');

        expect(story).toMatch(
            'Мышка 🐭 за бабку, бабка 👵 за дедку, дедка 👴 за репку. Тянут-потянут 🎉 вытянули репку!'
        );
    });

    test('Мужской род зовет на помощь', async () => {
        await text('');
        expect(await text('Дракона')).toMatch('Кого позвал дракон');
    });

    test('Женский род зовет на помощь', async () => {
        await text('');
        expect(await text('Бабку')).toMatch('Кого позвала бабка');
    });

    test('Средний род зовет на помощь', async () => {
        await text('');
        expect(await text('Чудище')).toMatch('Кого позвало чудище');
    });

    test('Сохраняет только героя в творительном падеже', async () => {
        await text('');
        expect(await text('Бутылка стола дракона')).toMatch('Дракон 🐉 за дедку');
    });

    test('Предпочтение одушевленным', async () => {
        await text('');
        expect(await text('Серёжку')).toMatch('Кого позвал сережка');
    });

    test('Правильно склоняет фразу переспрашивания героя', async () => {
        await text('');
        await text('внука');
        expect(await text('ракета')).toMatch('Кого позвал внук');

        await text('Бабку');
        expect(await text('ракета')).toMatch('Кого позвала бабка');

        await text('чудище');
        expect(await text('ракета')).toMatch('Кого позвало чудище');
    });

    test('Принимает персонажа в именительном падеже', async () => {
        await text('');
        expect(await text('человек')).toMatch('Человек за дедку');
        expect(await text('богатырь')).toMatch('Богатырь за человека');
        expect(await text('Внучок')).toMatch('Внучок за богатыря');
        expect(await text('Царица')).toMatch('Царица за внучка');
        expect(await text('Лебедь')).toMatch('Лебедь 🦢 за царицу');
        // TODO Лебедь распознается как фамилия жен. в вин. падеже
        // expect(await text('Врач')).toMatch('Врач за лебедя');
    });

    test('Приоритет вин. падежу', async () => {
        /**
         * внучк+а, а не вн+учка
         * Например дед позвал внучка
         */
        await text('');
        expect(await text('Внучка')).toMatch('Внучок за дедку');
    });

    test('Специальная фраза для рыбки', async () => {
        await text('');
        expect(await tts('золотую рыбку')).toMatch(
            /кликать золотую рыбку.*приплыла к нему рыбка, спросила/
        );

        await text('кошку');
        expect(await text('рыбку')).toMatch('стала она кликать');
    });

    test('Специальная фраза для кошек', async () => {
        await text('');
        expect(await tts('черную кошку')).toMatch(/Прибежала черная кошка.*вцепилась в дедку/);
        expect(await tts('кот мартоскин')).toMatch(/Прибежал кот.*вцепился в/);
    });

    test('Специальная фраза для мурки', async () => {
        await text('');
        expect(await tts('мурку')).toMatch(/Прибежала кошка мурка/);
    });

    test('Отбрасывает неодушевленное специальной фразой', async () => {
        await text('');
        expect(await text('лопату')).toMatch(/звал дедка лопату.*не дозвался/);
        expect(await text('ведро')).toMatch(/звал дедка ведро.*не дозвался/);
        expect(await text('чайник')).toMatch(/звал дедка чайник.*не дозвался/);
        expect(await text('окно')).toMatch(/звал дедка окно.*не дозвался/);
    });

    test('что ты умеешь / помощь', async () => {
        await text('');
        expect(await text('что ты умеешь')).toMatch('вместе сочиним сказку');
        await text('кошку');
        expect(await text('помощь')).toMatch(/вместе сочиним сказку.*кошка/i);
    });

    test('Повтор истории: подтверждение', async () => {
        await text('');
        expect(await text('мышку')).toMatch('вытянули репку');
        expect(await text('давай еще раз')).toMatch('осадил дед репку');

        expect(await text('мышку')).toMatch('вытянули репку');
        expect(await text('да пожалуйста')).toMatch('Посадил дед репку');

        expect(await text('мышку')).toMatch('вытянули репку');
        expect(await text('сначала')).toMatch('Посадил дед репку');
    });

    test('Отказ от продолжения словом Не надо', async () => {
        await text('');
        // FIXME: Если убрать await, тест упадет. Понять, почему.
        await text('мышку');
        expect(await text('больше не надо пожалуйста')).toMatch('конец');
    });

    test('Позвали лошадь (регрессия)', async () => {
        await text('');
        expect(await text('лошадь')).toMatch('Лошадь 🐴 за дедку');
        expect(await text('лошадь')).toMatch('Лошадь 🐴 за лошадь');
    });

    test('Для имен неопред. рода выбирается мужской', async () => {
        await text('');
        expect(await text('сашу')).toMatch('Кого позвал саша');
    });

    test('Принимает имя-фамилию', async () => {
        await text('');
        expect(await text('александра карпова')).toMatch(/Александр Карпов за дедку,/i);
        expect(await text('ирина карпова')).toMatch(/Ирина Карпова за Александра Карпова,/i);
        expect(await text('владимир путин')).toMatch(/Владимир Путин за Ирину Карпову,/i);
        expect(await tts('гарри поттер')).toMatch(/Гарри Поттер за Владимира Путина /i);
        expect(await text('фёдор емельяненко')).toMatch(/Федор Емельяненко за Гарри Поттера,/i);
        expect(await text('аллу пугачёву')).toMatch(/Алла Пугачева за Федора Емельяненко,/i);
    });

    test('Принимает прилагательное-существительное', async () => {
        await text('');
        expect(await text('железного человека')).toMatch('Железный человек за дедку');
        expect(await text('маленькую кошечку')).toMatch(
            'Маленькая кошечка 🐱 за железного человека,'
        );
        expect(await text('черную кошку')).toMatch('Черная кошка 🐱 за маленькую кошечку,');
        expect(await text('летний зайчик')).toMatch('Летний зайчик 🐰 за черную кошку,');
        expect(await text('летнюю пчелку')).toMatch('Летняя пчелка 🐝 за летнего зайчика,');
        expect(await text('зверя')).toMatch('Зверь за летнюю пчелку,');
    });

    test('Любого персонажа вин. падежа предпочитает Имени-Фамилии им. падежа', async () => {
        await tts('');
        expect(await tts('позвал Вася Пупкин котика')).toMatch(/котик за дедку/i);
    });

    test('Распознает Имя-Фамилия когда имя неопределенного пола', async () => {
        await text('');
        expect(await text('Саша Карпов')).toMatch(/Саша Карпов за дедку/i);
    });

    test('Очень короткие слова в вин. падеже.', async () => {
        await text('');
        expect(await text('пса')).toMatch('Пес за дедку');
        expect(await text('льва')).toMatch('Лев 🦁 за пса');
        expect(await text('котика')).toMatch('Котик 🐱 за льва');

        expect(await text('пес')).toMatch('Пес за котика');
        expect(await text('лев')).toMatch('Лев 🦁 за пса');
        expect(await text('котик')).toMatch('Котик 🐱 за льва');
    });

    test('Повтор истории: отказ', async () => {
        await text('');

        expect(await text('мышку')).toMatch('вытянули репку');
        const { speech, endSession } = await act('нет спасибо');

        expect(speech.text).toMatch('конец');
        expect(endSession).toEqual(true);
    });

    test('Спецфраза для жучки', async () => {
        await text('');
        expect(await text('жучку')).toMatch(/^Прибежала жучка\. Жучка 🐶 за дедку/);
    });

    test('Позвали буратино, пиноккио', async () => {
        await text('');
        expect(await text('буратино')).toMatch('Буратино за дедку');
        expect(await text('пиноккио')).toMatch('Пиноккио за буратино,');
        expect(await text('котик')).toMatch('Котик 🐱 за пиноккио,');
    });

    test('Распознает множ. число как ед.', async () => {
        await text('');
        expect(await text('кошек')).toMatch('Кошка 🐱 за дедку');
        expect(await text('котята')).toMatch('Котенок 🐱 за кошку');
    });

    test('Позвали осла', async () => {
        await text('');
        expect(await text('осла')).toMatch('Осел за дедку');
        expect(await text('котика')).toMatch('Котик 🐱 за осла,');
    });

    test('Позвали гонца', async () => {
        await text('');
        expect(await text('гонца')).toMatch('Гонец за дедку');
        expect(await text('котика')).toMatch('Котик 🐱 за гонца,');
    });

    test('Чёрный ворон не заменяется на ворону', async () => {
        await text('');
        expect(await tts('чёрного ворона')).toMatch(/Прилетел черный ворон .*черный ворон за/i);
        expect(await tts('чёрный ворон')).toMatch(/Прилетел черный ворон .*черный ворон за/i);
    });

    test('Не склоняет неод. сущности', async () => {
        await text('');
        expect(await tts('замок')).toMatch(/звал дедка замок/i);
    });

    test('Правильно склоняет милых коней', async () => {
        await text('');
        expect(await text('милые кони')).toMatch(/милый конь 🐴 за дедку/i);
        expect(await text('милые кони')).toMatch(/милый конь 🐴 за милого коня/i);
    });

    test('В конце концов распоздавать сущ. в любом падеже', async () => {
        await text('');
        expect(await tts('мальчику')).toMatch(/мальчик за дедку/i);
    });

    test('Чернила - неодущевленная сущность', async () => {
        await text('');
        expect(await tts('чернила')).toMatch(/звал дедка чернила/i);
    });

    test('Правильно склоняет Чёрного', async () => {
        await text('');
        expect(await text('черный')).toMatch(/черный за дедку/i);
        expect(await text('черный')).toMatch(/черный за черного/i);
    });

    test('Распознает персонажа из двук существительных', async () => {
        await text('');
        expect(await text('бабу ягу')).toMatch(/баба яга 🧙‍ за дедку/i);
        expect(await text('деда мороза')).toMatch(/дед мороз 🎅 за бабу ягу/i);
        expect(await text('человека паука')).toMatch(/человек паук за деда мороза/i);
        expect(await text('капитан америка')).toMatch(/капитан америка за человека паука/i);

        expect(await text('дед бабу')).toMatch(/баба 👵 за капитана америку/i);
        expect(await text('баба деда дудка')).toMatch(/дед 👴 за бабу/i);
        expect(await text('холод стул')).toMatch(/долго звал дед холод/i);
    });

    test('Не принимает два существительныз разного пола', async () => {
        await text('');
        expect(await text('Собака красный')).toMatch(/собака 🐶 за дедку/i);
    });

    test('Отбрасывает С', async () => {
        await text('');
        expect(await text('Дурачка с переулочка')).toMatch(/дурачок за дедку/i);
    });

    test('Отбрасывает повторение одного слова (такое случайно бывает)', async () => {
        await text('');
        expect(await text('Чебурашку чебурашку')).toMatch(/^Чебурашка за дедку/i);
    });

    test('Распознание ответов Да и Нет не чуствительно к регистру', async () => {
        await text('');
        await text('Мышку');
        expect(await text('Да')).toMatch(/посадил дед репку/i);
    });

    test('Принимает За зайцем (регрессия)', async () => {
        await text('');
        expect(await tts('за зайцем')).toMatch(/заяц за дедку/i);
    });

    test('История заканчивается когда становится очень длинной', async () => {
        let tale = await tts('');

        while (tale.length < 1024 && !/вытянули репку/i.test(tale)) {
            tale = await tts('маленького коненка');
        }

        expect(tale).toMatch(/вытянули репку/i);
    });

    test('Игнорирует эмоджи в команде', async () => {
        await tts('');
        expect(await tts('🐺 Серого волка')).toMatch(/серый волк/i);
    });

    test('Исправляет известные особенности распознавания речи', async () => {
        await text('');
        expect(await text('позвал сучку')).toMatch(/жучка 🐶 за дедку/i);
        expect(await text('позвал баку')).toMatch(/бабка 👵 за жучку/i);
        expect(await text('позвал жучка')).toMatch(/жучка 🐶 за бабку/i);
        expect(await text('позвал ручку')).toMatch(/жучка 🐶 за жучку/i);
        expect(await text('позвал ночку')).toMatch(/дочка 🧒 за жучку/i);
    });

    test('Не распознаёт слово «нет» как часть персонажа', async () => {
        await tts('');
        expect(await tts('Котик нет')).toMatch(/котик за дедку/i);
    });

    test('Исправляет tts для жучки', async () => {
        await tts('');
        expect(await tts('Жучка')).toMatch(/ж\+учка/i);
    });

    test('Распознаёт «огромную преогромную сильные сову»', async () => {
        await tts('');
        expect(await tts('позвал огромную преогромную сильные сову')).toMatch(/сильная сова/i);
    });

    test('Распознаёт несогласованные прил. и сущ.', async () => {
        await tts('');
        await tts('маленький гордый птица');

        expect(await tts('маленький гордый птица')).toMatch(
            /маленькая гордая птица за маленькую гордую птицу /i
        );
    });

    test('Не распознаёт «пришла» как пришлая', async () => {
        await text('');

        expect(await text('пришла бабушка')).toMatch(/^Пришла бабушка/i);
    });

    test('Распознаёт «детка» как «дедка», а не  «дедок»', async () => {
        await text('');

        expect(await text('детка')).toMatch(/дедка 👴 за дедку/i);
    });

    test('Распознаёт «ты», «тебя»', async () => {
        await text('');

        expect(await text('тебя')).toMatch(/я там была/i);
    });

    test('Кнопки с уже выбранными персонажами не должны приходить повторно', async () => {
        const shown: { [button: string]: boolean } = {};

        // Первые три вызова кнопки не приходят
        expect(await buttons('')).toEqual([]);
        expect(await buttons('Андрея')).toEqual([]);
        expect(await buttons('Андрея')).toEqual([]);

        let btns = await buttons('Андрея');
        expect(btns).toHaveLength(2);

        do {
            const [first, second] = btns;

            expect(shown).not.toHaveProperty(first.text);
            second && expect(shown).not.toHaveProperty(second.text);

            shown[first.text] = true;
            btns = await buttons(first.text);
        } while (btns.length);
    });

    describe('Счетчики', () => {
        test('New Game', async () => {
            expect(await events('')).toContainEqual(
                expect.objectContaining({ event_type: 'New Game' })
            );
        });

        test('Call Character', async () => {
            await act('котик');

            expect(await events('котик')).toContainEqual(
                expect.objectContaining({
                    event_type: 'Call Character',
                    event_properties: { name: 'котик' },
                })
            );

            expect(await events('Олега')).toContainEqual(
                expect.objectContaining({
                    event_type: 'Call Character',
                    event_properties: { name: 'олег' },
                })
            );

            expect(await events('кукуруку')).toContainEqual(
                expect.objectContaining({
                    event_type: 'Call Character',
                    event_properties: { name: 'кукурук' },
                })
            );
        });

        test('Call Thing', async () => {
            await act('котик');

            expect(await events('лопату')).toContainEqual(
                expect.objectContaining({
                    event_type: 'Call Thing',
                    event_properties: { name: 'лопата' },
                })
            );
        });
    });

    describe('Запросы пользователей', () => {
        test('жили были дед да баба…', async () => {
            await text('');
            expect(
                await tts(
                    'жили были дед да баба была у них курочка ряба снесла курочка яичко не простое а золотое'
                )
            ).toMatch('курочка яичко за дедку');
        });

        test('администратор за администратора…', async () => {
            await text('');
            expect(
                await tts('администратор за администратора администратора администратора')
            ).toMatch('администратор за дедку');
        });

        test('между нами тает лед…', async () => {
            await text('');
            expect(await tts('между нами тает лед позвал бабку')).toMatch('бабка за дедку');
        });

        test('снегурочку и деда мороза…', async () => {
            await text('');
            expect(await tts('снегурочку и деда мороза после нирваны')).toMatch(
                'дед мороз за дедку'
            );
        });

        test('уже вытащили давно…', async () => {
            await text('');
            expect(await tts('я уже вытащили давно что вы тут лечите')).toMatch(
                'Это не похоже на персонажа'
            );
        });

        test('медведь позвал…', async () => {
            await text('');
            expect(
                await tts(
                    'медведь позвал почему вот нам там пудрить это же по другому нужно так правильно что ли'
                )
            ).toMatch('медведь за дедку');
        });

        test('как тебя зовут…', async () => {
            await text('');
            expect(await tts('да только как тебя зовут алиса что ли')).toMatch('алиса за дедку');
        });

        test('золотую внучку…', async () => {
            await text('');
            expect(await tts('золотую внучку которая н не золотая')).toMatch(
                'золотая внучка за дедку'
            );
        });

        test('сестру русалку…', async () => {
            await text('');
            expect(await tts('русалка позвала свою еще 1 сестру русалку')).toMatch(
                'сестра русалка за дедку'
            );
        });

        test('черную причерную тучу…', async () => {
            await text('');
            expect(await tts('черную причерную тучу при тучу тучу тучу')).toMatch(
                'звал дедка тучу'
            );
        });

        test('ну и что то мы сдаемся…', async () => {
            await text('');
            expect(await tts('ну и что то мы сдаемся уже хватит уже')).toMatch(
                'не похоже на персонажа'
            );
        });

        test('александра валерьевича…', async () => {
            await text('');
            expect(await tts('он позвал александра валерьевича')).toMatch(
                /александр валерьевич за дедку/
            );
        });

        test('маньяк загадку гальки…', async () => {
            await text('');
            expect(await tts('маньяк загадку гальки за 300 за соплю')).toMatch(/сопля за дедку/);
        });

        test('жучка не умеет говорить…', async () => {
            await text('');
            expect(await tts('жучка не умеет говорить она не может никого позвать')).toMatch(
                /ж\+учка за дедку/
            );
        });
    });

    //#region tests infrastructure
    let sessionMock: Session;
    let requestMock: WebhookRequest;
    let eventsMock: EventsCollector;
    let stemmer: Stemmer = new DumpingStemmer(new MystemStemmer());

    async function act(command: string, random100 = 0): Promise<DialogResult> {
        const dialogResult = await mainDialog(command, sessionMock, eventsMock, {
            stemmer,
            random100,
        });

        sessionMock = dialogResult.session;
        requestMock.session.new = false;

        return dialogResult;
    }

    async function text(command: string, random100 = 0): Promise<string> {
        return (await act(command, random100)).speech.text;
    }

    async function tts(command: string, random100 = 0): Promise<string> {
        return (await act(command, random100)).speech.tts;
    }

    async function buttons(command: string, random100 = 0): Promise<SceneButton[]> {
        return (await act(command, random100)).buttons;
    }

    async function events(command: string, random100 = 0): Promise<readonly Event[]> {
        return (await act(command, random100)).events.events;
    }

    beforeEach(() => {
        sessionMock = Session.create(0);

        requestMock = {
            meta: {
                client_id: 'ru.yandex.searchplugin/7.16 (none none; android 4.4.2)',

                locale: 'ru-RU',
                timezone: 'UTC',
            },
            request: {
                command: 'котик',
                nlu: {
                    tokens: ['котик'],
                },
                original_utterance: 'котик',
                markup: {
                    dangerous_context: false,
                },
            },
            session: {
                message_id: 1,
                new: true,
                session_id: 'cf8ad214-d7482f07-a55c37a4-89ca72b0',
                skill_id: 'd72eedce-c6f5-412b-8ed7-93cdccd9b716',
                user_id: '62E12D32F4A76F3201DBE52C8D4F39065CB80D3DC23BC5233AEB808A54441BA4',
            },
            version: '1.0',
        };

        eventsMock = EventsCollector.create(0, requestMock, sessionMock);
    });
    //#endregion
});
