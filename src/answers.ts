import * as _ from 'lodash';
import { formatCharNominative, Character, isCharMale, isCharFamela } from './character';
import { SessionData } from './sessionData';

export function help(sessionData: SessionData) {
    const char = _.last(sessionData.chars);
    const about = 'Я рассказываю сказку про репку, а вы помогаете мне вспомнить персонажей.';

    if (char) {
        const call = `Кого ${formatCallWord(char)} ${formatCharNominative(char)} на помощь?`;
        return `${about} ${call}`;
    }

    return about;
}

function formatCallWord(char: Character) {
    return isCharMale(char) ? 'позвал' : isCharFamela(char) ? 'позвала' : 'позвало';
}
