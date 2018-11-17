import * as _ from 'lodash';
import { formatCharNominative, Character, isCharMale, isCharFamela } from './character';
import { SessionData } from './sessionData';

export function help(sessionData: SessionData) {
    const called = whoCalled(sessionData);
    const about = 'Я рассказываю сказку про репку, а вы помогаете мне вспомнить персонажей.';

    return `${about} ${called}`;
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
