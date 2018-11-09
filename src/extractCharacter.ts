import * as _ from 'lodash';
import { Character, Word, Gender } from './character';
import { Token, Gr, Lexeme } from './stemmer';

type LexemeEx = Lexeme & { text: string };

export function extractCharacter(tokens: Token[]): Character | undefined {
    const lexemes = tokensToLexemesEx(tokens);
    const [nounAccusative] = filterLexemes(lexemes, [Gr.Noun, Gr.Accusative]);

    if (!nounAccusative) {
        // Нет существительных в винительном падеже
        return undefined;
    }

    return {
        noun: lexemeToWord(nounAccusative),
        adjective: [],
        gender: extractGender(nounAccusative)
    };
}

function lexemeToWord(lexeme: LexemeEx): Word {
    return {
        nominative: lexeme.lex,
        accusative: lexeme.text
    };
}

export function createDedka(): Character {
    return {
        noun: { nominative: 'дедка', accusative: 'дедку' },
        adjective: [],
        gender: Gender.Male
    };
}

function filterLexemes(lexemes: LexemeEx[], grs: Gr[]): LexemeEx[] {
    return lexemes.filter(lex => grs.every(gr => lex.gr.includes(gr)));
}

function tokensToLexemesEx(tokens: Token[]): LexemeEx[] {
    const lexemesEx: LexemeEx[][] = tokens.map(token =>
        (token.analysis || []).map(lex => ({ ...lex, text: token.text }))
    );

    return _.flatten(lexemesEx);
}

function extractGender(lexeme: LexemeEx): Gender {
    if (lexeme.gr.includes(Gr.Male)) {
        return Gender.Male;
    }

    if (lexeme.gr.includes(Gr.Famela)) {
        return Gender.Famela;
    }

    return Gender.Neuter;
}
