import * as _ from 'lodash';
import { Character, Word, Gender, MultipleCharacters } from './character';
import { Token, Gr, Lexeme } from './stemmer';

type LexemeEx = Lexeme & { text: string };

export function extractCharacter(tokens: Token[]): Character | undefined {
    const lexemes = tokensToLexemesEx(tokens);
    const adjectives = filterLexemes(lexemes, [Gr.Adjective]);
    const animated = filterLexemes(lexemes, [Gr.Animated]);
    const nouns = filterLexemes(animated, [Gr.Noun]);
    const [nounAccusative] = filterLexemes(_.reverse(nouns), [Gr.Accusative, Gr.Single]);

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
    const [noun] = filterLexemes(lexemes, [Gr.Noun, Gr.Accusative, Gr.Mutliple]);

    if (!noun) {
        return undefined;
    }

    return {
        nominativeSingle: noun.lex,
        accusativeMutliple: cleanWord(noun.text)
    };
}

export function createDedka(): Character {
    return {
        noun: { nominative: 'дедка', accusative: 'дедку' },
        adjectives: [],
        gender: Gender.Male
    };
}

function lexemeToWord(lexeme: LexemeEx): Word {
    const accusative = cleanWord(lexeme.text);

    // Для прилагательных женского рода нужно
    // сохранять род в имен.падеже (стеммер приводит к муж.роду)
    if (matchGrs(lexeme.gr, [Gr.Adjective, Gr.Famela])) {
        return {
            nominative: adjAcusativeToNomenative(accusative),
            accusative
        };
    }

    return {
        nominative: lexeme.lex,
        accusative
    };
}

/**
 * Веняет вин род прилагательного в имен
 * Чёрную -> черная
 * @param adj Черный
 */
function adjAcusativeToNomenative(adj: string): string {
    const change = end => `${adj.substring(0, adj.length - 2)}${end}`;
    return adj.endsWith('ую') ? change('ая') : change('яя');
}

function cleanWord(raw: string) {
    return raw.toLowerCase().replace('ё', 'е');
}

function filterLexemes(lexemes: LexemeEx[], grs: Gr[]): LexemeEx[] {
    return lexemes.filter(lex => matchGrs(lex.gr, grs));
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

function matchGrs(gr: string, pattern: Gr[]) {
    const splitted = gr.split(/=|,|\||\(/);
    return pattern.every(p => splitted.includes(p));
}
