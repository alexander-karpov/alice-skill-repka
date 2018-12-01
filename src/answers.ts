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
import { sample } from './utils';
import { createSpeech, Speech, concatSpeech } from './speech';

const REPKA_GROWING =
    'Выросла репка большая-пребольшая. Стал дед репку из земли тянуть. Тянет-потянет, вытянуть не может. Позвал дед...';

const GRANTFATHER_PLANT_LOW = 'посадил дед репку';
const ABOUT_SKILL =
    'Я расскажу сказку про репку, если вы мне поможете. Когда придет время позвать на помощь нового героя, дополните рассказ. Например, я скажу: "Позвал дедка...", а вы продолжите - "Богатыря". Вы готовы?';

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
    return createSpeech(`${ABOUT_SKILL} ${called}`);
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

export function granny() {
    return createSpeech(
        `Бабушка-бабушка, почему у тебя такие большие руки? Чтобы лучше репку тянуть!`
    );
}

export function cat(char: Character, sessionData: SessionData, random100) {
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
        _.capitalize(comeRunning(char)),
        `${description}${name}`,
        meow,
        `и ${clung} в ${charAccusative(prev)}.`
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

function formatCallWord(char: Character) {
    return byGender(char, 'позвал', 'позвала', 'позвало');
}

function comeRunning(char: Character) {
    return byGender(char, 'прибежал', 'прибежала', 'прибежало');
}

function byGender<T>(char: Character, male: T, famela: T, other: T) {
    return isCharMale(char) ? male : isCharFamela(char) ? famela : other;
}
