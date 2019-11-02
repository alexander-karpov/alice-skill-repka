import { mainDialog } from './dialog';
import { stemmer } from './stemmer';
import { Session } from './Session';

describe('Main dialog', () => {
    test('Классическая сказка: начало', async () => {
        expect(await act('')).toMatch('осадил дед репку');
    });

    test('Классическая сказка: история', async () => {
        await act('');
        await act('Бабку');
        await act('Внучку');
        await act('Жучку');
        const story = await act('Кошку');

        expect(story).toMatch('Кошка 🐱 за жучку, жучка 🐶 за внучку, внучка 👧 за бабку,');
        expect(story).toMatch(
            'бабка 👵 за дедку, дедка 👴 за репку. Тянут-потянут — вытянуть не могут.',
        );
    });

    test('Классическая сказка: конец [позвали мышку]', async () => {
        await act('');
        await act('Бабку');
        const story = await act('Мышку');

        expect(story).toMatch(
            'Мышка 🐭 за бабку, бабка 👵 за дедку, дедка 👴 за репку. Тянут-потянут 🎉 вытянули репку!',
        );
    });

    test('Мужской род зовет на помощь', async () => {
        await act('');
        expect(await act('Дракона')).toMatch('Кого позвал дракон');
    });

    test('Женский род зовет на помощь', async () => {
        await act('');
        expect(await act('Бабку')).toMatch('Кого позвала бабка');
    });

    test('Средний род зовет на помощь', async () => {
        await act('');
        expect(await act('Чудище')).toMatch('Кого позвало чудище');
    });

    test('Сохраняет только героя в творительном падеже', async () => {
        await act('');
        expect(await act('Бутылка стола дракона')).toMatch('Дракон 🐉 за дедку');
    });

    test('Предпочтение одушевленным', async () => {
        await act('');
        expect(await act('Серёжку')).toMatch('Кого позвал сережка');
    });

    test('Правильно склоняет фразу переспрашивания героя', async () => {
        await act('');
        await act('внука');
        expect(await act('ракета')).toMatch('Кого позвал внук');

        await act('Бабку');
        expect(await act('ракета')).toMatch('Кого позвала бабка');

        await act('чудище');
        expect(await act('ракета')).toMatch('Кого позвало чудище');
    });

    test('Принимает персонажа в именительном падеже', async () => {
        await act('');
        expect(await act('человек')).toMatch('Человек за дедку');
        expect(await act('богатырь')).toMatch('Богатырь за человека');
        expect(await act('Внучок')).toMatch('Внучок за богатыря');
        expect(await act('Царица')).toMatch('Царица за внучка');
        expect(await act('Лебедь')).toMatch('Лебедь 🦢 за царицу');
        // TODO Лебедь распознается как фамилия жен. в вин. падеже
        // expect(await act('Врач')).toMatch('Врач за лебедя');
    });

    test('Приоритет вин. падежу', async () => {
        /**
         * внучк+а, а не вн+учка
         * Например дед позвал внучка
         */
        await act('');
        expect(await act('Внучка')).toMatch('Внучок за дедку');
    });

    test('Специальная фраза для рыбки', async () => {
        await act('');
        expect(await tts('золотую рыбку')).toMatch(
            /кликать золотую рыбку.*приплыла к нему рыбка, спросила/,
        );

        await act('кошку');
        expect(await act('рыбку')).toMatch('стала она кликать');
    });

    test('Специальная фраза для кошек', async () => {
        await act('');
        expect(await tts('черную кошку')).toMatch(/Прибежала черная кошка.*вцепилась в дедку/);
        expect(await tts('кот мартоскин')).toMatch(/Прибежал кот.*вцепился в/);
    });

    test('Специальная фраза для мурки', async () => {
        await act('');
        expect(await tts('мурку')).toMatch(/Прибежала кошка мурка/);
    });

    test('Отбрасывает неодушевленное специальной фразой', async () => {
        await act('');
        expect(await act('лопату')).toMatch(/звал дедка лопату.*не дозвался/);
        expect(await act('ведро')).toMatch(/звал дедка ведро.*не дозвался/);
        expect(await act('чайник')).toMatch(/звал дедка чайник.*не дозвался/);
        expect(await act('окно')).toMatch(/звал дедка окно.*не дозвался/);
    });

    test('что ты умеешь / помощь', async () => {
        await act('');
        expect(await act('что ты умеешь')).toMatch('вместе сочиним сказку');
        await act('кошку');
        expect(await act('помощь')).toMatch(/вместе сочиним сказку.*кошка/i);
    });

    test('Повтор истории: подтверждение', async () => {
        await act('');
        expect(await act('мышку')).toMatch('вытянули репку');
        expect(await act('давай еще раз')).toMatch('осадил дед репку');

        expect(await act('мышку')).toMatch('вытянули репку');
        expect(await act('да пожалуйста')).toMatch('Посадил дед репку');
    });

    test('Отказ от продолжения словом Не надо', async () => {
        await act('');
        // FIXME: Если убрать await, тест упадет. Понять, почему.
        await act('мышку');
        expect(await act('больше не надо пожалуйста')).toMatch('конец');
    });

    test('Позвали лошадь (регрессия)', async () => {
        await act('');
        expect(await act('лошадь')).toMatch('Лошадь 🐴 за дедку');
        expect(await act('лошадь')).toMatch('Лошадь 🐴 за лошадь');
    });

    test('Для имен неопред. рода выбирается мужской', async () => {
        await act('');
        expect(await act('сашу')).toMatch('Кого позвал саша');
    });

    test('Принимает имя-фамилию', async () => {
        await act('');
        expect(await act('александра карпова')).toMatch(/Александр Карпов за дедку,/i);
        expect(await act('ирина карпова')).toMatch(/Ирина Карпова за Александра Карпова,/i);
        expect(await act('владимир путин')).toMatch(/Владимир Путин за Ирину Карпову,/i);
        expect(await act('гарри поттер')).toMatch(/Гарри Поттер за Владимира Путина,/i);
        expect(await act('фёдор емельяненко')).toMatch(/Федор Емельяненко за Гарри Поттера,/i);
        expect(await act('аллу пугачёву')).toMatch(/Алла Пугачева за Федора Емельяненко,/i);
    });

    test('Принимает прилагательное-существительное', async () => {
        await act('');
        expect(await act('железного человека')).toMatch('Железный человек за дедку');
        expect(await act('маленькую кошечку')).toMatch(
            'Маленькая кошечка 🐱 за железного человека,',
        );
        expect(await act('черную кошку')).toMatch('Черная кошка 🐱 за маленькую кошечку,');
        expect(await act('летний зайчик')).toMatch('Летний зайчик 🐰 за черную кошку,');
        expect(await act('летнюю пчелку')).toMatch('Летняя пчелка 🐝 за летнего зайчика,');
        expect(await act('зверя')).toMatch('Зверь за летнюю пчелку,');
    });

    test('Любого персонажа вин. падежа предпочитает Имени-Фамилии им. падежа', async () => {
        await tts('');
        expect(await tts('позвал Вася Пупкин котика')).toMatch(/котик за дедку/i);
    });

    test('Распознает Имя-Фамилия когда имя неопределенного пола', async () => {
        await act('');
        expect(await act('Саша Карпов')).toMatch(/Саша Карпов за дедку/i);
    });

    test('Очень короткие слова в вин. падеже.', async () => {
        await act('');
        expect(await act('пса')).toMatch('Пес за дедку');
        expect(await act('льва')).toMatch('Лев 🦁 за пса');
        expect(await act('котика')).toMatch('Котик 🐱 за льва');

        expect(await act('пес')).toMatch('Пес за котика');
        expect(await act('лев')).toMatch('Лев 🦁 за пса');
        expect(await act('котик')).toMatch('Котик 🐱 за льва');
    });

    test('Повтор истории: отказ', async () => {
        await act('');
        expect(await act('мышку')).toMatch('вытянули репку');
        const {
            speech: { text },
            endSession,
        } = await mainDialog('нет спасибо', session, { stemmer, random100: 0 });

        expect(text).toMatch('конец');
        expect(endSession).toEqual(true);
    });

    test('Спецфраза для жучки', async () => {
        await act('');
        expect(await act('жучку')).toMatch(/^Прибежала жучка\. Жучка 🐶 за дедку/);
    });

    test('Позвали буратино, пиноккио', async () => {
        await act('');
        expect(await act('буратино')).toMatch('Буратино за дедку');
        expect(await act('пиноккио')).toMatch('Пиноккио за буратино,');
        expect(await act('котик')).toMatch('Котик 🐱 за пиноккио,');
    });

    test('Распознает множ. число как ед.', async () => {
        await act('');
        expect(await act('кошек')).toMatch('Кошка 🐱 за дедку');
        expect(await act('котята')).toMatch('Котенок 🐱 за кошку');
    });

    test('Позвали осла', async () => {
        await act('');
        expect(await act('осла')).toMatch('Осел за дедку');
        expect(await act('котика')).toMatch('Котик 🐱 за осла,');
    });

    test('Позвали гонца', async () => {
        await act('');
        expect(await act('гонца')).toMatch('Гонец за дедку');
        expect(await act('котика')).toMatch('Котик 🐱 за гонца,');
    });

    test('Чёрный ворон не заменяется на ворону', async () => {
        await act('');
        expect(await tts('чёрного ворона')).toMatch(/Прилетел черный ворон .*черный ворон за/i);
        expect(await tts('чёрный ворон')).toMatch(/Прилетел черный ворон .*черный ворон за/i);
    });

    test('Не склоняет неод. сущности', async () => {
        await act('');
        expect(await tts('замок')).toMatch(/звал дедка замок/i);
    });

    test('Правильно склоняет милых коней', async () => {
        await act('');
        expect(await act('милые кони')).toMatch(/милый конь 🐴 за дедку/i);
        expect(await act('милые кони')).toMatch(/милый конь 🐴 за милого коня/i);
    });

    test('В конце концов распоздавать сущ. в любом падеже', async () => {
        await act('');
        expect(await tts('мальчику')).toMatch(/мальчик за дедку/i);
    });

    test('Чернила - неодущевленная сущность', async () => {
        await act('');
        expect(await tts('чернила')).toMatch(/звал дедка чернила/i);
    });

    test('Правильно склоняет Чёрного', async () => {
        await act('');
        expect(await act('черный')).toMatch(/черный за дедку/i);
        expect(await act('черный')).toMatch(/черный за черного/i);
    });

    test('Распознает персонажа из двук существительных', async () => {
        await act('');
        expect(await act('бабу ягу')).toMatch(/баба яга 🧙‍ за дедку/i);
        expect(await act('деда мороза')).toMatch(/дед мороз 🎅 за бабу ягу/i);
        expect(await act('человека паука')).toMatch(/человек паук за деда мороза/i);
        expect(await act('капитан америка')).toMatch(/капитан америка за человека паука/i);

        expect(await act('дед бабу')).toMatch(/баба 👵 за капитана америку/i);
        expect(await act('баба деда дудка')).toMatch(/дед 👴 за бабу/i);
        expect(await act('холод стул')).toMatch(/долго звал дед холод/i);
    });

    test('Не принимает два существительныз разного пола', async () => {
        await act('');
        expect(await act('Собака красный')).toMatch(/собака 🐶 за дедку/i);
    });

    test('Отбрасывает С', async () => {
        await act('');
        expect(await act('Дурачка с переулочка')).toMatch(/дурачок за дедку/i);
    });

    test('Отбрасывает повторение одного слова (такое случайно бывает)', async () => {
        await act('');
        expect(await act('Чебурашку чебурашку')).toMatch(/^Чебурашка за дедку/i);
    });

    test('Распознание ответов Да и Нет не чуствительно к регистру', async () => {
        await act('');
        await act('Мышку');
        expect(await act('Да')).toMatch(/посадил дед репку/i);
    });

    test('Принимает За зайцем (регрессия)', async () => {
        await act('');
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
        await act('');
        expect(await act('позвал сучку')).toMatch(/жучка 🐶 за дедку/i);
        expect(await act('позвал баку')).toMatch(/бабка 👵 за жучку/i);
        expect(await act('позвал жучка')).toMatch(/жучка 🐶 за бабку/i);
        expect(await act('позвал ручку')).toMatch(/жучка 🐶 за жучку/i);
        expect(await act('позвал ночку')).toMatch(/дочка 🧒 за жучку/i);
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
            /маленькая гордая птица за маленькую гордую птицу /i,
        );
    });

    test('Не распознаёт «пришла» как пришлая', async () => {
        await act('');

        expect(await act('пришла бабушка')).toMatch(/^Пришла бабушка/i);
    });

    test('Распознаёт «детка» как «дедка», а не  «дедок»', async () => {
        await act('');

        expect(await act('детка')).toMatch(/дедка 👴 за дедку/i);
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

    describe('Запросы пользователей', () => {
        test('жили были дед да баба…', async () => {
            await act('');
            expect(
                await tts(
                    'жили были дед да баба была у них курочка ряба снесла курочка яичко не простое а золотое',
                ),
            ).toMatch('курочка яичко за дедку');
        });

        test('администратор за администратора…', async () => {
            await act('');
            expect(
                await tts('администратор за администратора администратора администратора'),
            ).toMatch('администратор за дедку');
        });

        test('между нами тает лед…', async () => {
            await act('');
            expect(await tts('между нами тает лед позвал бабку')).toMatch('бабка за дедку');
        });

        test('снегурочку и деда мороза…', async () => {
            await act('');
            expect(await tts('снегурочку и деда мороза после нирваны')).toMatch(
                'дед мороз за дедку',
            );
        });

        test('уже вытащили давно…', async () => {
            await act('');
            expect(await tts('я уже вытащили давно что вы тут лечите')).toMatch(
                'Это не похоже на персонажа',
            );
        });

        test('медведь позвал…', async () => {
            await act('');
            expect(
                await tts(
                    'медведь позвал почему вот нам там пудрить это же по другому нужно так правильно что ли',
                ),
            ).toMatch('медведь за дедку');
        });

        test('как тебя зовут…', async () => {
            await act('');
            expect(await tts('да только как тебя зовут алиса что ли')).toMatch('алиса за дедку');
        });

        test('золотую внучку…', async () => {
            await act('');
            expect(await tts('золотую внучку которая н не золотая')).toMatch(
                'золотая внучка за дедку',
            );
        });

        test('сестру русалку…', async () => {
            await act('');
            expect(await tts('русалка позвала свою еще 1 сестру русалку')).toMatch(
                'сестра русалка за дедку',
            );
        });

        test('черную причерную тучу…', async () => {
            await act('');
            expect(await tts('черную причерную тучу при тучу тучу тучу')).toMatch(
                'звал дедка тучу',
            );
        });

        test('ну и что то мы сдаемся…', async () => {
            await act('');
            expect(await tts('ну и что то мы сдаемся уже хватит уже')).toMatch(
                'не похоже на персонажа',
            );
        });

        test('александра валерьевича…', async () => {
            await act('');
            expect(await tts('он позвал александра валерьевича')).toMatch(
                /александр валерьевич за дедку/,
            );
        });

        test('маньяк загадку гальки…', async () => {
            await act('');
            expect(await tts('маньяк загадку гальки за 300 за соплю')).toMatch(/сопля за дедку/);
        });

        test('жучка не умеет говорить…', async () => {
            await act('');
            expect(await tts('жучка не умеет говорить она не может никого позвать')).toMatch(
                /ж\+учка за дедку/,
            );
        });
    });

    //#region tests infrastructure
    let session: Session;

    async function act(command: string, random100 = 0): Promise<string> {
        const {
            speech: { text },
            session: nextSession,
        } = await mainDialog(command, session, { stemmer, random100 });
        session = nextSession;
        return text;
    }

    async function tts(command: string, random100 = 0): Promise<string> {
        const {
            speech: { tts },
            session: nextSession,
        } = await mainDialog(command, session, { stemmer, random100 });
        session = nextSession;
        return tts;
    }

    async function buttons(command: string, random100 = 0) {
        const { buttons, session: nextSession } = await mainDialog(command, session, {
            stemmer,
            random100,
        });
        session = nextSession;
        return buttons;
    }

    beforeEach(() => {
        session = Session.create();
    });
    //#endregion
});
