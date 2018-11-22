import * as _ from 'lodash';
import { formatCharNominative, Character, isCharMale, isCharFamela } from './character';
import { SessionData } from './sessionData';
import { sample } from './utils';

const REPKA_GROWING =
    'Выросла репка большая-пребольшая. Стал дед репку из земли тянуть. Тянет-потянет, вытянуть не может. Позвал дед... Кого?';

const GRANTFATHER_PLANT_LOW = 'посадил дед репку';
const ABOUT_SKILL =
    'Я рассказываю сказку про репку, а вы называете персонажей. Помогите дедке вытянуть репку.';

export function storyBegin(random100: number) {
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

    return `${sample(cases, random100)} ${REPKA_GROWING}`;
}

export function intro(random100: number) {
    const beforeAbout = ['Хорошо.', 'Давайте.', 'С удовольствием!'];
    return `${sample(beforeAbout, random100)} ${ABOUT_SKILL}`;
}

export function help(sessionData: SessionData) {
    const called = whoCalled(sessionData);
    return `${ABOUT_SKILL} ${called}`;
}

export function onlyOneCharMayCome(sessionData: SessionData) {
    const answer = `Я точно помню, в этой сказке все приходили по одному.`;
    const called = whoCalled(sessionData);

    return `${answer} ${called}`;
}

export function whoCalled(sessionData: SessionData) {
    const char = _.last(sessionData.chars);

    if (char) {
        return `Кого ${formatCharNominative(char)} ${formatCallWord(char)} на помощь?`;
    }

    return '';
}

function formatCallWord(char: Character) {
    return isCharMale(char) ? 'позвал' : isCharFamela(char) ? 'позвала' : 'позвало';
}
