import * as _ from 'lodash';
import {
    charNominative,
    charAccusative,
    Character,
    isCharMale,
    isCharFamela,
    previousChar
} from './character';
import { SessionData } from './sessionData';
import { sample, lazySample } from './utils';
import { createSpeech, Speech, concatSpeech } from './speech';

const REPKA_GROWING =
    'Выросла репка большая-пребольшая. Стал дед репку из земли тянуть. Тянет-потянет, вытянуть не может. Позвал дед...';

const GRANTFATHER_PLANT_LOW = 'посадил дед репку';
const ABOUT_SKILL = concatSpeech(
    'Я расскажу сказку про репку, если вы мне поможете. Когда придет время позвать на помощь нового героя, дополните рассказ. Например, я скажу: "Позвал дедка...", а вы продолжите - "Богатыря". Вы готовы?'
);

export function storyBegin(random100: number): Speech {
    const cases = [
        `Давным-давно в далёкой деревне ${GRANTFATHER_PLANT_LOW}.`,
        `Жили-были дед да баба. И вот ${GRANTFATHER_PLANT_LOW}.`,
        `В стародавние времена жил на свете дед. И вот отнажды ${GRANTFATHER_PLANT_LOW}.`,
        `На опушке большого леса ${GRANTFATHER_PLANT_LOW}.`,
        `Однажды ${GRANTFATHER_PLANT_LOW}.`,
        `Где-то далеко, в тридесятом царстве ${GRANTFATHER_PLANT_LOW}.`,
        `Жил на опушке дремучего леса дед. ${_.capitalize(GRANTFATHER_PLANT_LOW)}.`,
        `В некотором царстве ${GRANTFATHER_PLANT_LOW}.`,
        `Давно тому назад ${GRANTFATHER_PLANT_LOW}.`,
        `В одной деревне ${GRANTFATHER_PLANT_LOW}.`,
        `Жарким летним днем ${GRANTFATHER_PLANT_LOW}.`,
        `${_.capitalize(GRANTFATHER_PLANT_LOW)}.`
    ];

    return concatSpeech(sample(cases, random100), REPKA_GROWING);
}

export function intro(random100: number): Speech {
    const beforeAbout = ['Хорошо.', 'Давайте.', 'С удовольствием!'];
    return concatSpeech(sample(beforeAbout, random100), ABOUT_SKILL, storyBegin(random100));
}

export function help(sessionData: SessionData) {
    const called = whoCalled(sessionData);
    return concatSpeech(ABOUT_SKILL, called);
}

export function onlyOneCharMayCome(sessionData: SessionData) {
    const answer = `Я точно помню, в этой сказке все приходили по одному.`;
    const called = whoCalled(sessionData);

    return createSpeech(`${answer} ${called}`);
}

export function whoCalled(sessionData: SessionData) {
    const char = _.last(sessionData.chars);

    if (char) {
        return `Кого ${charNominative(char)} ${formatCallWord(char)} на помощь?`;
    }

    return '';
}

export function repka(sessionData: SessionData) {
    return createSpeech(`Репка сама себя не вытянет. ${whoCalled(sessionData)}`);
}

export function babushka() {
    return createSpeech(
        `Бабушка-бабушка, почему у тебя такие большие руки? Чтобы лучше репку тянуть!`
    );
}

export function kot(char: Character, sessionData: SessionData, random100) {
    const soundNumber = sample(byGender(char, [1, 2], [3, 4], [1]), random100);
    const meow = createSpeech(
        '- мяу -',
        `<speaker audio="alice-sounds-animals-cat-${soundNumber}.opus">`
    );

    const prev = previousChar(char, sessionData.chars) as Character;
    const clung = byGender(char, 'вцепился', 'вцепилась', 'вцепилось');
    const name = charNominative(char);
    const description = name === 'мурка' ? 'кошка ' : '';

    return concatSpeech(
        byGender(char, 'Прибежал', 'Прибежала', 'Прибежало'),
        `${description}${name}`,
        meow,
        `и ${clung} в ${charAccusative(prev)}.`
    );
}

export function slon(random100: number): Speech {
    return concatSpeech(
        `Что делал слон, когда пришёл на поле он?`,
        elephant(random100),
        'Помогал репку тянуть.'
    );
}

export function rybka(currentChar: Character) {
    const nemu = byGender(currentChar, 'нему', 'ней', 'нему');
    const poshel = byGender(currentChar, 'Пошёл', 'Пошла', 'Пошло');
    const stalOn = byGender(currentChar, 'Стал он', 'Стал она', 'Стало оно');

    return concatSpeech(
        `${poshel} ${charNominative(currentChar)} к синему морю;`,
        sea(),
        `${stalOn} кликать рыбку, приплыла к ${nemu} рыбка, спросила:`,
        `«Чего тебе надобно ${charNominative(currentChar)}?»`,
        `Ей с поклоном ${charNominative(currentChar)} отвечает:`,
        `«Смилуйся, государыня рыбка, помоги вытянуть репку.»`
    );
}

export function yesOrNoExpected(): Speech {
    return createSpeech(
        'Сейчас я ожидаю в ответ "Да" или "Нет".',
        'сейчас я ожидаю в ответ - - да - - или  нет.'
    );
}

export function endOfStory() {
    return createSpeech('Вот и сказке конец, А кто слушал — молодец.');
}

export function wrongCommand(sessionData: SessionData) {
    return concatSpeech(`Это не похоже на персонажа.`, help(sessionData));
}

export function inanimateCalled(inanimate: Character, sessionData: SessionData, random100: number) {
    const lastChar = _.last(sessionData.chars) as Character;
    const zval = byGender(lastChar, 'звал', 'звала', 'звало');
    const jdal = byGender(lastChar, 'ждал', 'ждала', 'ждало');

    return lazySample(
        [
            () =>
                concatSpeech(
                    `Долго ${zval} ${charNominative(lastChar)} ${charAccusative(inanimate)} —`,
                    createSpeech(
                        byGender(lastChar, 'не дозвался.', 'не дозвалась.', 'не дозвалось.'),
                        byGender(lastChar, 'не дозв+ался.', 'не дозвал+ась.', 'не дозвал+ось.')
                    ),
                    'Давайте позовем другого персонажа.',
                    whoCalled(sessionData)
                ),
            () =>
                concatSpeech(
                    `Долго ${jdal} ${charNominative(lastChar)} ответа,`,
                    createSpeech(
                        byGender(lastChar, 'не дождался', 'не дождалась', 'не дождалось'),
                        byGender(
                            lastChar,
                            '- - не дожд+ался - -',
                            '- - не дождал+ась',
                            '- - не дождал+ось - -'
                        )
                    ),
                    `, к репке`,
                    createSpeech(
                        byGender(lastChar, 'воротился', 'воротилась', 'воротилось'),
                        byGender(lastChar, 'ворот+ился', 'ворот+илась', 'ворот+илось')
                    ),
                    `. И ${formatCallWord(lastChar)} другого персонажа.`,
                    whoCalled(sessionData)
                ),
            () =>
                concatSpeech(
                    `Свойство ${charNominative(inanimate)} ${byGender(
                        inanimate,
                        'имел',
                        'имела',
                        'имело'
                    )}: говорить ${byGender(inanimate, 'он умел', 'она умела', 'оно умело')}.`,
                    byGender(inanimate, 'Попросил', 'Попросила', 'Попросило'),
                    'позвать другого персонажа.',
                    whoCalled(sessionData)
                )
        ],
        random100
    );
}

export function sobaka(sobaka: Character, random100: number) {
    const soundNumber = sample([1, 3, 4, 5], random100);
    const woof = createSpeech(
        '- гав-гав.',
        `<speaker audio="alice-sounds-animals-dog-${soundNumber}.opus">`
    );

    return concatSpeech(
        'Прибежала',
        charNominative(sobaka),
        woof,
        'повиляла хвостиком и тоже стала репку тянуть.'
    );
}

function formatCallWord(char: Character) {
    return byGender(char, 'позвал', 'позвала', 'позвало');
}

function byGender<T>(char: Character, male: T, famela: T, other: T) {
    return isCharMale(char) ? male : isCharFamela(char) ? famela : other;
}

function elephant(random100: number): Speech {
    const n = sample([1, 2], random100);
    return createSpeech('', `<speaker audio="alice-sounds-animals-elephant-${n}.opus">`, {
        ttsOnly: true
    });
}

function sea(): Speech {
    return createSpeech('', `<speaker audio="alice-sounds-nature-sea-1.opus">`, {
        ttsOnly: true
    });
}

// function guitar(random100: number): Speech {
//     const accoud = sample(['a', 'c', 'e', 'g'], random100);
//     return createSpeech('', `<speaker audio="alice-music-guitar-${accoud}-1.opus">`, {
//         ttsOnly: true
//     });
// }

// function delay(times: number): Speech {
//     return createSpeech('', '-' + _.repeat(' -', times - 1), {
//         ttsOnly: true
//     });
// }
