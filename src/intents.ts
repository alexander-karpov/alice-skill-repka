import { Lexeme, Gr, filterLexemes } from './stemmer';
import { Character } from './character';

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

export function babka(char: Character) {
    return ['бабка', 'бабушка'].includes(char.subject.nominative);
}

export function cat(char: Character) {
    return ['кошка', 'кошечка', 'кот', 'котик', 'котенок', 'мурка'].includes(
        char.subject.nominative
    );
}

export function help(tokens: string[]) {
    const command = tokens.join(' ');
    return command === 'что ты умеешь' || command === 'помощь';
}

export function yes(tokens: string[]) {
    return tokens.some(t => ['да', 'давай'].includes(t));
}

export function no(tokens: string[]) {
    return tokens.some(t => t === 'нет');
}
