import * as _ from 'lodash';
import { Character, Word, Gender, MultipleCharacters } from './character';
import { Token, Gr, Lexeme } from './stemmer';

type LexemeEx = Lexeme & { text: string };

export function extractCharacter(tokens: Token[]): Character | undefined {
    const lexemes = tokensToLexemesEx(tokens);
    const animated = filterLexemes(lexemes, [Gr.Animated]);
    const nouns = filterLexemes(animated, [Gr.Noun]);
    const adjectives = filterLexemes(animated, [Gr.Adjective]);
    const [nounAccusative] = filterLexemes(_.reverse(nouns), [Gr.AccusativeSingle]);

    if (!nounAccusative) {
        return undefined;
    }

    const adjectivesWithoutFoundNoun = adjectives.filter(a => a.lex !== nounAccusative.lex);

    return {
        noun: lexemeToWord(nounAccusative),
        adjectives: adjectivesWithoutFoundNoun.map(lexemeToWord),
        gender: extractGender(nounAccusative)
    };
}

export function extractMultipleChars(tokens: Token[]): MultipleCharacters | undefined {
    const lexemes = tokensToLexemesEx(tokens);
    const [noun] = filterLexemes(lexemes, [Gr.Noun, Gr.AccusativeMutliple]);

    if (!noun) {
        return undefined;
    }

    return {
        nominativeSingle: noun.lex,
        accusativeMutliple: noun.text
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
        adjectives: [],
        gender: Gender.Male
    };
}

function filterLexemes(lexemes: LexemeEx[], grs: Gr[]): LexemeEx[] {
    return lexemes.filter(lex => grs.every(gr => lex.gr.includes(gr)));
}

// function sortLexemes(lexemes: LexemeEx[], gr: Gr): LexemeEx[] {
//     return lexemes.slice().sort((a, b) => {
//         const isAIncludes = a.gr.includes(gr);
//         const isBIncludes = b.gr.includes(gr);

//         return Number(isBIncludes) - Number(isAIncludes);
//     });
// }

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
