import * as _ from 'lodash';
import { Character, Word, Gender } from './character';
import { Lexeme, Gr, filterLexemes, matchGrs } from './stemmer';

export function extractCharacter(lexemes: Lexeme[]): Character | undefined {
    const nouns = filterLexemes(lexemes, [Gr.Animated, Gr.Noun, Gr.Single]);

    const noun =
        _.first(filterLexemes(nouns, [Gr.Accusative])) ||
        _.first(filterLexemes(nouns, [Gr.Nominative])) ||
        _.first(nouns);

    if (!noun) {
        return undefined;
    }
    return {
        subject: lexemeToWord(noun),
        gender: extractGender(noun)
    };
}

export function createDedka(): Character {
    return {
        subject: { nominative: 'дедка', accusative: 'дедку' },
        gender: Gender.Male
    };
}

export function extractInanimate(lexemes: Lexeme[]): Character | undefined {
    const nouns = filterLexemes(lexemes, [Gr.Inanimated, Gr.Noun, Gr.Single]);

    const noun =
        _.first(filterLexemes(nouns, [Gr.Accusative])) ||
        _.first(filterLexemes(nouns, [Gr.Nominative])) ||
        _.first(nouns);

    if (!noun) {
        return undefined;
    }

    return {
        subject: {
            nominative: noun.lex,
            accusative: nominativeToAccusativeInanimated(noun)
        },
        gender: extractGender(noun)
    };
}

function lexemeToWord(lexeme: Lexeme): Word {
    const accusative = nominativeToAccusative(lexeme);

    return {
        nominative: lexeme.lex,
        accusative
    };
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

/**
 * Меняет падеж существительного с им. на вин.
 * @param noun Существительное в им. падеже.
 */
function nominativeToAccusative(lexeme: Lexeme) {
    const gr = lexeme.gr;
    const nomenative = lexeme.lex;
    const isMale = matchGrs(gr, [Gr.Male]);
    const isFamela = matchGrs(gr, [Gr.Famela]);
    const isNeuter = matchGrs(gr, [Gr.Neuter]);

    const endsWith = end => nomenative.endsWith(end);
    const changeOne = end => `${nomenative.substring(0, nomenative.length - 1)}${end}`;
    const changeTwo = end => `${nomenative.substring(0, nomenative.length - 2)}${end}`;
    const add = end => `${nomenative}${end}`;

    if (isNeuter) {
        return nomenative;
    }

    // Папа -> папу, мама -> маму
    if (endsWith('а')) {
        return changeOne('у');
    }

    // Маня -> маню
    if (endsWith('я')) {
        return changeOne('ю');
    }

    // Отец -> отца, кузнец -> кузнеца
    if (endsWith('ец')) {
        return changeTwo('ца');
    }

    // Богатырь -> богатыря, конь -> коня.
    if (endsWith('ь') && isMale) {
        return changeOne('я');
    }

    // Евгений -> евгения, злодей -> злодея
    if (endsWith('й') && isMale) {
        return changeOne('я');
    }

    // Внучок -> внучка, дружок -> дружка
    if (endsWith('ок') && isMale) {
        return changeTwo('ка');
    }

    // Дочь, ...?
    if (endsWith('ь') && isFamela) {
        return changeOne('я');
    }

    // Человек -> человека, кролик -> кролика.
    return add('а');
}

/**
 * Меняет падеж неод. существительного с им. на вин.
 * @param noun Существительное в им. падеже.
 */
function nominativeToAccusativeInanimated(lexeme: Lexeme) {
    const gr = lexeme.gr;
    const isFamela = matchGrs(gr, [Gr.Famela]);
    const nomenative = lexeme.lex;

    const endsWith = end => nomenative.endsWith(end);
    const changeOne = end => `${nomenative.substring(0, nomenative.length - 1)}${end}`;

    // Икона -> икону, тарелка -> тарелку.
    if (isFamela && endsWith('а')) {
        return changeOne('у');
    }

    if (isFamela && endsWith('я')) {
        return changeOne('ю');
    }

    return nomenative;
}
