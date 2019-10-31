import { Character, Word, Gender } from './character';
import { findSeq } from './utils/seq';
import { Lexeme, Gr, Token, isLexemeAccept, isTokenAccept } from './tokens';
import { multiplyArrays } from './utils/multiplyArrays';
import { Predicate } from './core';

// #region Gr patterns
const S = (l: Lexeme) => isLexemeAccept(l, [Gr.S]);
const Acc = (l: Lexeme) => isLexemeAccept(l, [Gr.Acc]);
const Nom = (l: Lexeme) => isLexemeAccept(l, [Gr.Nom]);
const Anim = (l: Lexeme) => isLexemeAccept(l, [Gr.anim]);
const Single = (l: Lexeme) => isLexemeAccept(l, [Gr.single]);
const Persn = (l: Lexeme) => isLexemeAccept(l, [Gr.persn]);
const Famn = (l: Lexeme) => isLexemeAccept(l, [Gr.famn]);
const Male = (l: Lexeme) => isLexemeAccept(l, [Gr.Male]);
const Famela = (l: Lexeme) => isLexemeAccept(l, [Gr.Famela]);
const Unisex = (l: Lexeme) => isLexemeAccept(l, [Gr.Unisex]);
const NotTokenA = (l: Lexeme) => !isTokenAccept(l, [Gr.A]);
const NotName = (l: Lexeme) => !isLexemeAccept(l, [Gr.persn]) && !isLexemeAccept(l, [Gr.famn]);

function x(...ps: Predicate<Lexeme>[]): Predicate<Lexeme> {
    return (l: Lexeme) => ps.every(p => p(l));
}

const subjectPatterns: Predicate<Lexeme>[][] = [
    [x(Persn, Acc, Male), x(Famn, Acc)],
    [x(Persn, Acc, Famela, Single), x(Famn, Acc)],
    [x(Persn, Acc, Unisex), x(Famn, Acc)],
    [x(S, Anim, Single, Acc, NotTokenA), x(S, Acc)],
    [x(S, Anim, Single, Acc, NotTokenA, NotName)],
    [x(Persn, Nom, Male), x(Famn, Nom)],
    [x(Persn, Nom, Famela), x(Famn, Nom)],
    [x(Persn, Nom, Unisex), x(Famn, Nom)],
    [x(S, Anim, Single, Nom, NotTokenA), x(S, Nom, NotTokenA)],
    [x(S, Anim, Single, Nom, NotTokenA)],
    [x(S, Anim, Single)],
    [x(S, Anim)],
];
// #endregion

export function extractChar(tokens: Token[]): Character | undefined {
    const fixdedTokens = fixTokens(tokens);
    const subject = extractSubject(fixdedTokens);

    if (!subject) {
        return undefined;
    }

    const predicates = extractPredicates(subject, fixdedTokens);
    const subjectFirst = subject[0] as Lexeme;

    const word: Word = {
        nominative: predicates
            .map(p => AToCnsistent(p, subjectFirst).nominative)
            .concat(subject.map(s => s.lex))
            .join(' '),
        accusative: predicates
            .map(p => AToCnsistent(p, subjectFirst).accusative)
            .concat(subject.map(l => SToAccCnsistent(l, subjectFirst)))
            .join(' '),
    };

    return {
        subject: word,
        normal: subject[0].lex,
        gender: extractGender(subjectFirst),
    };
}

export function extractSubject(tokens: Token[]): Lexeme[] | undefined {
    const production = multiplyArrays(...tokens.map(t => t.lexemes));

    for (let pattern of subjectPatterns) {
        for (let sentence of production) {
            const matches = findSeq(sentence, pattern);

            if (matches) {
                return matches;
            }
        }
    }

    return undefined;
}

function extractPredicates(subject: Lexeme[], tokens: Token[]): Lexeme[] {
    const findLexeme = (token: Token, grs: Gr[]) => token.lexemes.find(l => isLexemeAccept(l, grs));

    const reversed = tokens.slice(0, subject[0].position);
    reversed.reverse();
    const predicates: Lexeme[] = [];

    for (let token of reversed) {
        const a = findLexeme(token, [Gr.A]);

        if (a) {
            predicates.unshift(a);
        } else {
            break;
        }
    }

    return predicates;
}

function AToCnsistent(lexeme: Lexeme, consistentWith: Lexeme): Word {
    const isFamela = isLexemeAccept(consistentWith, [Gr.Famela]);

    if (isFamela) {
        return {
            nominative: AToNomFamela2(lexeme.lex),
            accusative: AToAccFamela2(lexeme.lex),
        };
    }

    return {
        nominative: lexeme.lex,
        accusative: AToAccMale(lexeme.lex),
    };
}

/**
 * Меняет род прилагательного с муж. на жен.
 * @param lexeme
 */
function AToNomFamela2(lex: string) {
    const endsWith = (end: string) => lex.endsWith(end);
    const changeTwo = (end: string) => `${lex.substring(0, lex.length - 2)}${end}`;
    const changeThree = (end: string) => `${lex.substring(0, lex.length - 3)}${end}`;

    if (endsWith('кий')) {
        return changeThree('кая');
    }

    if (endsWith('ний')) {
        return changeThree('няя');
    }

    if (endsWith('ий')) {
        return changeTwo('яя');
    }

    if (endsWith('ый')) {
        return changeTwo('ая');
    }

    if (endsWith('ой')) {
        return changeTwo('ая');
    }

    return lex;
}

/**
 * Меняет род прилагательного с муж. на жен.
 * @param lexeme
 */
function AToAccFamela2(lex: string) {
    const endsWith = (end: string) => lex.endsWith(end);
    const changeTwo = (end: string) => `${lex.substring(0, lex.length - 2)}${end}`;
    const changeThree = (end: string) => `${lex.substring(0, lex.length - 3)}${end}`;

    if (endsWith('ний')) {
        return changeThree('нюю');
    }

    if (endsWith('ий')) {
        return changeTwo('ую');
    }

    if (endsWith('ый')) {
        return changeTwo('ую');
    }

    if (endsWith('ой')) {
        return changeTwo('ую');
    }

    return lex;
}

function AToAccMale(lex: string) {
    const endsWith = (end: string) => lex.endsWith(end);
    const changeTwo = (end: string) => `${lex.substring(0, lex.length - 2)}${end}`;

    if (endsWith('ий') || endsWith('ие')) {
        return changeTwo('его');
    }

    if (endsWith('ый') || endsWith('ые')) {
        return changeTwo('ого');
    }

    if (endsWith('ая')) {
        return changeTwo('ую');
    }

    if (endsWith('яя')) {
        return changeTwo('юю');
    }

    return lex;
}

function SToAccCnsistent(lexeme: Lexeme, consistentWith: Lexeme): string {
    const isFamela = isLexemeAccept(consistentWith, [Gr.Famela]);
    const isMale = isLexemeAccept(consistentWith, [Gr.Male]);
    const isNeuter = isLexemeAccept(consistentWith, [Gr.Neuter]);
    const isA = isLexemeAccept(lexeme, [Gr.A]);

    // Чудище -> чудище
    if (isNeuter) {
        return lexeme.lex;
    }

    /**
     * Для существительных от прилагательных (напр. черный)
     * нужно использовать правила склонения как для пригалат.
     */
    if (isA) {
        return AToCnsistent(lexeme, lexeme).accusative;
    }

    if (isMale) {
        return SToAccMale(lexeme.lex);
    }

    if (isFamela) {
        return SToAccFamela(lexeme.lex);
    }

    return lexeme.lex;
}

function SToAccFamela(lex: string) {
    const endsWith = (end: string) => lex.endsWith(end);
    const changeOne = (end: string) => `${lex.substring(0, lex.length - 1)}${end}`;

    // мама -> маму
    if (endsWith('а')) {
        return changeOne('у');
    }

    // Маня -> маню
    if (endsWith('я')) {
        return changeOne('ю');
    }

    // Дочь, лошадь?
    if (endsWith('ь')) {
        return lex;
    }

    return lex;
}

function SToAccMale(lex: string) {
    const endsWith = (end: string) => lex.endsWith(end);
    const changeOne = (end: string) => `${lex.substring(0, lex.length - 1)}${end}`;
    const changeTwo = (end: string) => `${lex.substring(0, lex.length - 2)}${end}`;
    const add = (end: string) => `${lex}${end}`;

    // Чёрный -> чёрного
    if (endsWith('ый')) {
        return changeTwo('ого');
    }

    // Папа -> папу
    if (endsWith('а')) {
        return changeOne('у');
    }

    // Отец -> отца, кузнец -> кузнеца
    if (endsWith('ец')) {
        return changeTwo('ца');
    }

    // Богатырь -> богатыря, конь -> коня.
    if (endsWith('ь')) {
        return changeOne('я');
    }

    // Евгений -> евгения, злодей -> злодея
    if (endsWith('й')) {
        return changeOne('я');
    }

    // Буратино
    if (endsWith('о')) {
        return lex;
    }

    // Внучок -> внучка, дружок -> дружка
    if (endsWith('ок')) {
        return changeTwo('ка');
    }

    // Гарри
    if (endsWith('и')) {
        return lex;
    }

    // Пес -> пса
    if (endsWith('ес')) {
        return changeTwo('са');
    }

    // Осел -> осла, дятел -> дятла.
    if (endsWith('ел')) {
        return changeTwo('ла');
    }

    // Лев -> льва
    if (endsWith('ев')) {
        return changeTwo('ьва');
    }

    // Человек -> человека, кролик -> кролика.
    return add('а');
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

export function extractInanimate(tokens: Token[]): Character | undefined {
    const production = multiplyArrays(...tokens.map(t => t.lexemes));

    const SInanAcc = (l: Lexeme) => isLexemeAccept(l, [Gr.inan, Gr.S, Gr.Acc]);
    const SInanNom = (l: Lexeme) => isLexemeAccept(l, [Gr.inan, Gr.S, Gr.Nom]);

    for (let sentence of production) {
        const found = findSeq(sentence, [SInanAcc]) || findSeq(sentence, [SInanNom]);

        if (found) {
            const [char] = found;
            const isFamela = isLexemeAccept(char, [Gr.Famela]);

            return {
                subject: {
                    nominative: char.lex,
                    accusative: isFamela ? SToAccFamela(char.lex) : char.lex,
                },
                normal: char.lex,
                gender: extractGender(char),
            };
        }
    }

    return undefined;
}

/**
 * Перед распознаванием нужно удалить
 * «вредные» слова.
 */
function fixTokens(tokens: Token[]): Token[] {
    // «Нет» распознаётся как неод.существительное
    return tokens.filter(t => t.text !== 'нет');
}
