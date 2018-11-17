import * as _ from 'lodash';
import { Character, Word, Gender } from './character';
import { Lexeme, Gr, filterLexemes, matchGrs } from './stemmer';

export function extractCharacter(lexemes: Lexeme[]): Character | undefined {
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

export function createDedka(): Character {
    return {
        subject: { nominative: 'дедка', accusative: 'дедку' },
        attributes: [],
        gender: Gender.Male
    };
}

function lexemeToWord(lexeme: Lexeme): Word {
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

function extractGender(lexeme: Lexeme): Gender {
    if (lexeme.gr.includes(Gr.Male)) {
        return Gender.Male;
    }

    if (lexeme.gr.includes(Gr.Famela)) {
        return Gender.Famela;
    }

    return Gender.Neuter;
}
