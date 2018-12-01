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
    const noun = lexeme.lex;
    const isMale = matchGrs(gr, [Gr.Male]);
    const isFamela = matchGrs(gr, [Gr.Famela]);
    const isNeuter = matchGrs(gr, [Gr.Neuter]);

    const changeOne = end => `${noun.substring(0, noun.length - 1)}${end}`;
    const changeTwo = end => `${noun.substring(0, noun.length - 2)}${end}`;
    const add = end => `${noun}${end}`;

    if (isNeuter) {
        return noun;
    }

    // Папа -> папу, мама -> маму
    if (noun.endsWith('а')) {
        return changeOne('у');
    }

    // Маня -> маню
    if (noun.endsWith('я')) {
        return changeOne('ю');
    }

    // Отец -> отца, кузнец -> кузнеца
    if (noun.endsWith('ец')) {
        return changeTwo('ца');
    }

    // Богатырь -> богатыря, конь -> коня.
    if (noun.endsWith('ь') && isMale) {
        return changeOne('я');
    }

    // Евгений -> евгения, злодей -> злодея
    if (noun.endsWith('й') && isMale) {
        return changeOne('я');
    }

    // Внучок -> внучка, дружок -> дружка
    if (noun.endsWith('ок') && isMale) {
        return changeTwo('ка');
    }

    // Дочь, ...?
    if (noun.endsWith('ь') && isFamela) {
        return changeOne('я');
    }

    // Человек -> человека, кролик -> кролика.
    return add('а');
}
