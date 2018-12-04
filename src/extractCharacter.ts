import * as _ from 'lodash';
import { Character, Word, Gender } from './character';
import { Lexeme, Gr, filterLexemes, matchGrs, findLexeme, Token } from './stemmer';
import { matchSeq, Maybe } from './utils/seq';

export function extractCharacter(tokens: Token[], lexemes: Lexeme[]): Character | undefined {
    const fullNameChar = extractFullNameChar(tokens);

    if (fullNameChar) {
        return fullNameChar;
    }

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
    const isUnisex = matchGrs(gr, [Gr.Unisex]);

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

    // Евгений -> евгения, злодей -> злодея
    if (endsWith('о') && isUnisex) {
        return nomenative;
    }

    // Внучок -> внучка, дружок -> дружка
    if (endsWith('ок') && isMale) {
        return changeTwo('ка');
    }

    // Гарри
    if (endsWith('и') && isMale) {
        return nomenative;
    }

    // Дочь, лошадь?
    if (endsWith('ь') && isFamela) {
        return nomenative;
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

function extractFullNameChar(tokens: Token[]): Maybe<Character> {
    const maleFirstName = t => findLexeme(t, [Gr.persn, Gr.Male]);
    const maleLastName = t =>
        findLexeme(t, [Gr.famn, Gr.Male]) || findLexeme(t, [Gr.famn, Gr.Unisex]);
    const famelaFirstName = t => findLexeme(t, [Gr.persn, Gr.Famela]);
    const famelaLastName = t =>
        findLexeme(t, [Gr.famn, Gr.Famela]) || findLexeme(t, [Gr.famn, Gr.Unisex]);
    const space = t => _.isEmpty(t.lexemes);

    const fullNameLexemes =
        matchSeq(tokens, [maleFirstName, maleLastName], space) ||
        matchSeq(tokens, [famelaFirstName, famelaLastName], space);

    if (!fullNameLexemes) {
        return undefined;
    }

    const [firstNameWord, lastNameWord] = fullNameLexemes.map(lexemeToWord);

    return {
        subject: {
            nominative: `${_.upperFirst(firstNameWord.nominative)} ${_.upperFirst(
                lastNameWord.nominative
            )}`,
            accusative: `${_.upperFirst(firstNameWord.accusative)} ${_.upperFirst(
                lastNameWord.accusative
            )}`
        },
        gender: extractGender(fullNameLexemes[0])
    };
}
