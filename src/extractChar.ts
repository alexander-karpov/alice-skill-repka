import * as _ from 'lodash';
import { Character, Word, Gender } from './character';
import { matchSeq } from './utils/seq';
import { Lexeme, Gr, matchGrs, Token, tokenSelector } from './tokens';

export function extractChar(tokens: Token[]): Character | undefined {
    const indexedChars = [
        extractFullNameChar(tokens),
        extractAttrChar(tokens),
        extractAnimChar(tokens),
    ].filter(Boolean) as [Character, number][];

    const [last] = _.sortBy(indexedChars, [o => -o[1]]);
    return last && last[0];
}

function lexemeToWord(lexeme: Lexeme, token: Token): Word {
    const accusative = lexeme.gr.includes(Gr.S) ? SNomToAcc(lexeme) : ANomToAcc(lexeme, token);
    const nominative =
        lexeme.gr.includes(Gr.Famela) && lexeme.gr.includes(Gr.A)
            ? ANomMaleToFamela(lexeme, token)
            : lexeme.lex;

    return {
        nominative,
        accusative,
    };
}

function extractGender(lexeme: Lexeme): Gender {
    if (lexeme.gr.includes(Gr.Male)) {
        return Gender.Male;
    }

    if (lexeme.gr.includes(Gr.Unisex)) {
        return Gender.Unisex;
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
    if (isMale && endsWith('ь')) {
        return changeOne('я');
    }

    // Евгений -> евгения, злодей -> злодея
    if (isMale && endsWith('й')) {
        return changeOne('я');
    }

    // ?
    if (isUnisex && endsWith('о')) {
        return nomenative;
    }

    // Буратино
    if (isMale && endsWith('о')) {
        return nomenative;
    }

    // Внучок -> внучка, дружок -> дружка
    if (isMale && endsWith('ок')) {
        return changeTwo('ка');
    }

    // Гарри
    if (isMale && endsWith('и')) {
        return nomenative;
    }

    // Пес -> пса
    if (isMale && endsWith('ес')) {
        return changeTwo('са');
    }

    // Осел -> осла, дятел -> дятла.
    if (isMale && endsWith('ел')) {
        return changeTwo('ла');
    }

    // Лев -> льва
    if (isMale && endsWith('ев')) {
        return changeTwo('ьва');
    }

    // Дочь, лошадь?
    if (isFamela && endsWith('ь')) {
        return nomenative;
    }

    if (nomenative === 'бобер') {
        return 'бобра';
    }

    // Человек -> человека, кролик -> кролика.
    return add('а');
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

function extractFullNameChar(tokens: Token[]): [Character, number] | undefined {
    const maleFirstName = tokenSelector([Gr.persn, Gr.Male], [Gr.persn, Gr.Unisex]);
    const maleLastName = tokenSelector([Gr.famn, Gr.Male], [Gr.famn, Gr.Unisex]);

    const famelaFirstName = tokenSelector([Gr.persn, Gr.Famela], [Gr.persn, Gr.Unisex]);
    const famelaLastName = tokenSelector([Gr.famn, Gr.Famela], [Gr.famn, Gr.Unisex]);

    const fullNameLexemes =
        matchSeq(tokens, [maleFirstName, maleLastName]) ||
        matchSeq(tokens, [famelaFirstName, famelaLastName]);

    if (!fullNameLexemes) {
        return undefined;
    }

    const firstNameWord = lexemeToWord(...fullNameLexemes[0]);
    const lastNameWord = lexemeToWord(...fullNameLexemes[1]);
    const tokenIndex = tokens.indexOf(fullNameLexemes[1][1]);

    return [
        {
            subject: {
                nominative: `${_.upperFirst(firstNameWord.nominative)} ${_.upperFirst(
                    lastNameWord.nominative,
                )}`,
                accusative: `${_.upperFirst(firstNameWord.accusative)} ${_.upperFirst(
                    lastNameWord.accusative,
                )}`,
            },
            normal: firstNameWord.nominative,
            gender: extractGender(fullNameLexemes[0][0]),
        },
        tokenIndex,
    ];
}

/**
 * Пытается найти цепочку прилагательное-существительное
 * @param tokens
 */
function extractAttrChar(tokens: Token[]): [Character, number] | undefined {
    const ANom = tokenSelector([Gr.A, Gr.Nom]);
    const AAcc = tokenSelector([Gr.A, Gr.Acc]);
    const SNom = tokenSelector([Gr.S, Gr.Nom, Gr.anim]);
    const SAcc = tokenSelector([Gr.S, Gr.Acc, Gr.anim]);

    const matches = matchSeq(tokens, [AAcc, SAcc]) || matchSeq(tokens, [ANom, SNom]);

    if (!matches) {
        return undefined;
    }

    const [adj, noun] = matches.map(m => lexemeToWord(...m));
    const tokenIndex = tokens.indexOf(matches[1][1]);

    return [
        {
            subject: {
                nominative: `${adj.nominative} ${noun.nominative}`,
                accusative: `${adj.accusative} ${noun.accusative}`,
            },
            normal: noun.nominative,
            gender: extractGender(matches[1][0]),
        },
        tokenIndex,
    ];
}

function extractAnimChar(tokens: Token[]): [Character, number] | undefined {
    const sAnim = [Gr.anim, Gr.S];

    const found =
        matchSeq(tokens, [tokenSelector(sAnim.concat(Gr.Acc, Gr.single))]) ||
        matchSeq(tokens, [tokenSelector(sAnim.concat(Gr.Nom, Gr.single))]) ||
        matchSeq(tokens, [tokenSelector(sAnim.concat(Gr.Acc))]) ||
        matchSeq(tokens, [tokenSelector(sAnim.concat(Gr.Nom))]);

    if (!found) return undefined;
    const [char] = found;
    const tokenIndex = tokens.indexOf(found[0][1]);

    return [
        {
            subject: lexemeToWord(char[0], char[1]),
            gender: extractGender(char[0]),
            normal: char[0].lex,
        },
        tokenIndex,
    ];
}

export function extractInanimate(tokens: Token[]): Character | undefined {
    const inanimSingle = [Gr.inanim, Gr.S, Gr.single];

    const found =
        matchSeq(tokens, [tokenSelector(inanimSingle.concat(Gr.Acc))]) ||
        matchSeq(tokens, [tokenSelector(inanimSingle.concat(Gr.Nom))]);

    if (!found) return undefined;
    const [char] = found;

    return {
        subject: lexemeToWord(char[0], char[1]),
        normal: char[0].lex,
        gender: extractGender(char[0]),
    };
}
