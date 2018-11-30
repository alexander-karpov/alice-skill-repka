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
