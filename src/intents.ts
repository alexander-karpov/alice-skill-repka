import { Lexeme, Gr, filterLexemes } from './stemmer';
import { Character } from './character';
import * as seq from './utils/seq';

export function hasMultipleChars(lexemes: Lexeme[]) {
    const [nounMultiple] = filterLexemes(lexemes, [
        Gr.Noun,
        Gr.Accusative,
        Gr.Animated,
        Gr.Mutliple
    ]);

    return Boolean(nounMultiple);
}

export function repka(lexemes: Lexeme[]) {
    return lexemes.length === 1 && lexemes && lexemes[0].lex === 'репка';
}

export function babushka(char: Character) {
    return ['бабка', 'бабушка'].includes(char.subject.nominative);
}

export function kot(char: Character) {
    return ['кошка', 'кошечка', 'кот', 'котик', 'котенок', 'мурка', 'киска'].includes(
        char.subject.nominative
    );
}

export function slon(char: Character) {
    return ['слон', 'слоник', 'слоненок', 'слониха'].includes(char.subject.nominative);
}

export function rybka(char: Character) {
    return ['рыба', 'рыбка'].includes(char.subject.nominative);
}

export function sobaka(char: Character) {
    return ['жучка', 'собака', 'собачка'].includes(char.subject.nominative);
}

export function help(tokens: string[]) {
    const command = tokens.join(' ');
    return command === 'что ты умеешь' || command === 'помощь';
}

export function yes(tokens: string[]) {
    return tokens.some(t => ['да', 'давай', 'давайте', 'продолжай', 'ладно'].includes(t));
}

export function no(tokens: string[]) {
    return Boolean(
        tokens.includes('достаточно') ||
            tokens.includes('хватит') ||
            tokens.includes('нет') ||
            seq.matchSeq(tokens, [seq.eq('не'), seq.eq('надо')])
    );
}
