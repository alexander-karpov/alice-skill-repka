import * as _ from 'lodash';
import { Character, Word, Gender, MultipleCharacters } from './character';
import { Token, Gr } from './stemmer';

type LexemeEx = { lex: string; gr: string[]; text: string };

export function extractCharacter(tokens: Token[]): Character | undefined {
    const lexemes = tokensToLexemesEx(tokens);
    const adjectives = filterLexemes(lexemes, [Gr.Adjective]);
    const animated = filterLexemes(lexemes, [Gr.Animated]);
    const nouns = filterLexemes(animated, [Gr.Noun]);
    const [nounAccusative] = filterLexemes(_.reverse(nouns), [Gr.Accusative, Gr.Single]);

    if (!nounAccusative) {
        return undefined;
    }

    const attributesWithoutFoundNoun = adjectives.filter(a => a.lex !== nounAccusative.lex);

    return {
        subject: lexemeToWord(nounAccusative),
        attributes: attributesWithoutFoundNoun.map(lexemeToWord),
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
        accusativeMutliple: noun.text
    };
}

export function createDedka(): Character {
    return {
        subject: { nominative: 'дедка', accusative: 'дедку' },
        attributes: [],
        gender: Gender.Male
    };
}

function lexemeToWord(lexeme: LexemeEx): Word {
    const accusative = lexeme.text;

    // Для прилагательных женского рода нужно
    // сохранять род в имен.падеже (стеммер приводит к муж.роду)
    if (matchGrs(lexeme.gr, [Gr.Adjective, Gr.Famela])) {
        return {
            nominative: attrAcusativeToNomenative(accusative),
            accusative
        };
    }

    // Для прилагательных среднего рода
    // имен. падеж совпадает с вин.
    if (matchGrs(lexeme.gr, [Gr.Adjective, Gr.Neuter])) {
        return {
            nominative: accusative,
            accusative
        };
    }

    return {
        nominative: lexeme.lex,
        accusative
    };
}

/**
 * Веняет вин падеж прилагательного в имен
 * Чёрную -> черная
 * @param attr Черный
 */
function attrAcusativeToNomenative(attr: string): string {
    const change = end => `${attr.substring(0, attr.length - 2)}${end}`;
    return attr.endsWith('ую') ? change('ая') : change('яя');
}

function filterLexemes(lexemes: LexemeEx[], grs: Gr[]): LexemeEx[] {
    return lexemes.filter(lex => matchGrs(lex.gr, grs));
}

function tokensToLexemesEx(tokens: Token[]): LexemeEx[] {
    function clean(raw: string) {
        return raw.toLowerCase().replace('ё', 'е');
    }

    const lexemesEx: LexemeEx[][] = tokens.map(token =>
        (token.analysis || []).map(lex => ({
            lex: lex.lex,
            gr: lex.gr.split(/=|,|\||\(/),
            text: clean(token.text)
        }))
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

function matchGrs(gr: string[], pattern: Gr[]) {
    return pattern.every(p => gr.includes(p));
}
