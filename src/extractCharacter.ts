import * as _ from 'lodash';
import { Character, Word, Gender } from './character';
import { Lexeme, Gr, filterLexemes, matchGrs, findLexeme, Token } from './stemmer';
import { matchSeq, Maybe } from './utils/seq';

export function extractCharacter(tokens: Token[], lexemes: Lexeme[]): Character | undefined {
    const fullNameChar = extractFullNameChar(tokens);

    if (fullNameChar) {
        return fullNameChar;
    }

    const attrsChar = extractСharWithAttribute(tokens);

    if (attrsChar) {
        return attrsChar;
    }

    const nouns = filterLexemes(lexemes, [Gr.Animated, Gr.S, Gr.Single]);

    const noun =
        _.first(filterLexemes(nouns, [Gr.Acc])) ||
        _.first(filterLexemes(nouns, [Gr.Nom])) ||
        _.first(nouns);

    if (!noun) {
        return undefined;
    }

    const token = tokens.find(t => t.lexemes.includes(noun));

    if (!token) {
        return undefined;
    }

    return {
        subject: lexemeToWord(noun, token),
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
    const nouns = filterLexemes(lexemes, [Gr.Inanimated, Gr.S, Gr.Single]);

    const noun =
        _.first(filterLexemes(nouns, [Gr.Acc])) ||
        _.first(filterLexemes(nouns, [Gr.Nom])) ||
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

function lexemeToWord(lexeme: Lexeme, token: Token): Word {
    const accusative = lexeme.gr.includes(Gr.S) ? SNomToAcc(lexeme) : ANomToAcc(lexeme, token);
    const nominative =
        lexeme.gr.includes(Gr.Famela) && lexeme.gr.includes(Gr.A)
            ? ANomMaleToFamela(lexeme, token)
            : lexeme.lex;

    return {
        nominative,
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
function SNomToAcc(lexeme: Lexeme) {
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

/**
 * Меняет падеж прилагательного с им. на вин.
 * @param noun Существительное в им. падеже.
 */
function ANomToAcc(lexeme: Lexeme, token: Token) {
    if (lexeme.gr.includes(Gr.Acc)) {
        return token.text;
    }

    const nom = token.text;
    const endsWith = end => nom.endsWith(end);
    const changeTwo = end => `${nom.substring(0, nom.length - 2)}${end}`;

    if (endsWith('ий')) {
        return changeTwo('его');
    }

    if (endsWith('ый')) {
        return changeTwo('ого');
    }

    if (endsWith('ая')) {
        return changeTwo('ую');
    }

    if (endsWith('яя')) {
        return changeTwo('юю');
    }

    return nom;
}

/**
 * Меняет род прилагательного с муж. на жен.
 * @param lexeme
 */
function ANomMaleToFamela(lexeme: Lexeme, token: Token) {
    if (lexeme.gr.includes(Gr.Nom)) {
        return token.text;
    }

    const nom = token.text;
    const endsWith = end => nom.endsWith(end);
    const changeTwo = end => `${nom.substring(0, nom.length - 2)}${end}`;

    if (endsWith('ую')) {
        return changeTwo('ая');
    }

    if (endsWith('юю')) {
        return changeTwo('яя');
    }

    return nom;
}

function extractFullNameChar(tokens: Token[]): Maybe<Character> {
    const maleFirstName = t => findLexeme(t, [Gr.persn, Gr.Male]);
    const maleLastName = t =>
        findLexeme(t, [Gr.famn, Gr.Male]) || findLexeme(t, [Gr.famn, Gr.Unisex]);
    const famelaFirstName = t => findLexeme(t, [Gr.persn, Gr.Famela]);
    const famelaLastName = t =>
        findLexeme(t, [Gr.famn, Gr.Famela]) || findLexeme(t, [Gr.famn, Gr.Unisex]);

    const fullNameLexemes =
        matchSeq(tokens, [maleFirstName, maleLastName]) ||
        matchSeq(tokens, [famelaFirstName, famelaLastName]);

    if (!fullNameLexemes) {
        return undefined;
    }

    const token0 = tokens.find(t => t.lexemes.includes(fullNameLexemes[0]));
    const token1 = tokens.find(t => t.lexemes.includes(fullNameLexemes[1]));

    if (!token0 || !token1) {
        return undefined;
    }

    const firstNameWord = lexemeToWord(fullNameLexemes[0], token0);
    const lastNameWord = lexemeToWord(fullNameLexemes[1], token1);

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

/**
 * Пытается найти цепочку прилагательное-существительное
 * @param tokens
 */
function extractСharWithAttribute(tokens: Token[]): Maybe<Character> {
    const ANom = matcher([Gr.A, Gr.Nom]);
    const AAcc = matcher([Gr.A, Gr.Acc]);
    const SNom = matcher([Gr.S, Gr.Nom, Gr.Animated]);
    const SAcc = matcher([Gr.S, Gr.Acc, Gr.Animated]);

    const matches = matchSeq(tokens, [AAcc, SAcc]) || matchSeq(tokens, [ANom, SNom]);

    if (!matches) {
        return undefined;
    }

    const [adj, noun] = matches.map(m => lexemeToWord(...m));

    return {
        subject: {
            nominative: `${adj.nominative} ${noun.nominative}`,
            accusative: `${adj.accusative} ${noun.accusative}`
        },
        gender: extractGender(matches[1][0])
    };
}

function matcher(grs: Gr[]): (x: Token) => [Lexeme, Token] | undefined {
    return (token: Token) => {
        const lexeme = findLexeme(token, grs);
        return lexeme ? [lexeme, token] : undefined;
    };
}
