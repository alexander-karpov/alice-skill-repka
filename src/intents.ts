import { Lexeme, Gr, filterLexemes } from './stemmer';

export function hasMultipleChars(lexemes: Lexeme[]) {
    const [nounMultiple] = filterLexemes(lexemes, [Gr.Noun, Gr.Accusative, Gr.Mutliple]);

    return Boolean(nounMultiple);
}
