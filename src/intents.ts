import { Gr, findLexeme, Token } from './tokens';
import { Character } from './character';
import { matchSeq } from './utils/seq';

export function hasMultipleChars(tokens: Token[]) {
    return tokens.some(t => !!findLexeme(t, [Gr.S, Gr.Acc, Gr.anim, Gr.plural]));
}

export function repka(tokens: Token[]) {
    return tokens.some(t => t.lexemes.length === 1 && t.lexemes[0].lex === 'репка');
}

export function babushka(char: Character) {
    return ['бабка', 'бабушка', 'баба'].some(alias => char.subject.nominative.includes(alias));
}

export function kot(char: Character) {
    return ['кошка', 'кошечка', 'кот', 'котик', 'котенок', 'мурка', 'киска'].some(alias =>
        char.subject.nominative.includes(alias)
    );
}

export function slon(char: Character) {
    return ['слон', 'слоник', 'слоненок', 'слониха'].some(alias =>
        char.subject.nominative.includes(alias)
    );
}

export function rybka(char: Character) {
    return ['рыба', 'рыбка'].some(alias => char.subject.nominative.includes(alias));
}

export function help(tokens: string[]) {
    const command = tokens.join(' ');
    return command === 'что ты умеешь' || command === 'помощь';
}

export function yes(tokens: string[]) {
    return tokens.some(t => ['да', 'давай', 'давайте', 'продолжай', 'ладно', 'хочу'].includes(t));
}

export function no(tokens: string[]) {
    function eq<T>(value: T) {
        return (x: T) => (x === value ? x : undefined);
    }

    return Boolean(
        tokens.includes('достаточно') ||
            tokens.includes('хватит') ||
            tokens.includes('нет') ||
            matchSeq(tokens, [eq('не'), eq('надо')])
    );
}
