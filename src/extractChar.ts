import { Character, Word, Gender } from './character';
import { findSeq } from './utils/seq';
import { Lexeme, Gr, Token, isLexemeGrsAccept, isLexemeAccept } from './tokens';
import { extractSAnim, extractSAnimSInan, extractASAnim2 } from './entities';
import { multiplyArrays } from './utils/multiplyArrays';

export function extractChar(tokens: Token[]): Character | undefined {
    const indexedChars = [
        extractAttrChar(tokens),
        extractSS(tokens),
        extractJuchka(tokens),
        extractBabka(tokens),
        extractAnimChar(tokens),
        extractChipollino(tokens),
    ].filter(Boolean) as [Character, number][];

    const [last] = indexedChars.sort((a, b) => b[1] - a[1]);
    return last && last[0];
}

function lexemeToWord(lexeme: Lexeme): Word {
    const accusative = lexeme.gr.includes(Gr.S) ? SNomToAcc(lexeme) : ANomToAcc(lexeme);
    const nominative =
        lexeme.gr.includes(Gr.Famela) && lexeme.gr.includes(Gr.A)
            ? ANomMaleToFamela(lexeme)
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
    const nomenative = lexeme.lex;
    const isMale = isLexemeAccept(lexeme, [Gr.Male]);
    const isFamela = isLexemeAccept(lexeme, [Gr.Famela]);
    const isNeuter = isLexemeAccept(lexeme, [Gr.Neuter]);
    const isUnisex = isLexemeAccept(lexeme, [Gr.Unisex]);
    const isInanim = isLexemeAccept(lexeme, [Gr.inan]);
    const isPlural = isLexemeAccept(lexeme, [Gr.plural]);
    const isA = isLexemeGrsAccept(lexeme, [Gr.A]);

    const endsWith = (end: string) => nomenative.endsWith(end);
    const changeOne = (end: string) => `${nomenative.substring(0, nomenative.length - 1)}${end}`;
    const changeTwo = (end: string) => `${nomenative.substring(0, nomenative.length - 2)}${end}`;
    const add = (end: string) => `${nomenative}${end}`;

    /**
     * Для существительных от прилагательных (напр. черный)
     * нужно использовать правила склонения как для пригалат.
     */
    if (isA) {
        return ANomToAcc(lexeme);
    }

    // Чернила -> чернила
    if (isInanim && isPlural) {
        return nomenative;
    }

    // Замок -> замок
    if (isMale && isInanim) {
        return nomenative;
    }

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

    // FIXME: MyStem выдает сначала бобер, потом бобр.
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
function ANomToAcc(lexeme: Lexeme) {
    const text = lexeme.text;
    const isAcc = lexeme.gr.includes(Gr.Acc);
    const isSingle = lexeme.gr.includes(Gr.single);
    const endsWith = (end: string) => text.endsWith(end);
    const changeTwo = (end: string) => `${text.substring(0, text.length - 2)}${end}`;

    if (isAcc && isSingle) {
        /**
         * Mystem привотид пригал. женского рода к мужскому.
         * Чтобы проще было сохранить род, сохраняем текст как есть в ед. числе.
         */
        return text;
    }

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

    return text;
}

/**
 * Меняет род прилагательного с муж. на жен.
 * @param lexeme
 */
function ANomMaleToFamela(lexeme: Lexeme) {
    if (lexeme.gr.includes(Gr.Nom)) {
        return lexeme.text;
    }

    const nom = lexeme.text;
    const endsWith = (end: string) => nom.endsWith(end);
    const changeTwo = (end: string) => `${nom.substring(0, nom.length - 2)}${end}`;

    if (endsWith('ую')) {
        return changeTwo('ая');
    }

    if (endsWith('юю')) {
        return changeTwo('яя');
    }

    return nom;
}

/**
 * Пытается найти цепочку прилагательное-существительное
 * @param tokens
 */
function extractAttrChar(tokens: Token[]): [Character, number] | undefined {
    const char = extractASAnim2(tokens);

    if (!char) return undefined;

    const [adj, noun] = char.map(l => lexemeToWord(l));

    return [
        {
            subject: {
                nominative: `${adj.nominative} ${noun.nominative}`,
                accusative: `${adj.accusative} ${noun.accusative}`,
            },
            normal: noun.nominative,
            gender: extractGender(char[1]),
        },
        char[1].position,
    ];
}

function extractAnimChar(tokens: Token[]): [Character, number] | undefined {
    const char = extractSAnim(tokens);

    if (!char) return undefined;

    return [
        {
            subject: lexemeToWord(char),
            gender: extractGender(char),
            normal: char.lex,
        },
        char.position,
    ];
}

/**
 * Персо
 * @param tokens
 */
function extractSS(tokens: Token[]): [Character, number] | undefined {
    const char = extractSAnimSInan(tokens);

    if (!char) return undefined;

    const [anim, inan] = char.map(m => lexemeToWord(m));

    return [
        {
            subject: {
                nominative: `${anim.nominative} ${inan.nominative}`,
                accusative: `${anim.accusative} ${inan.accusative}`,
            },
            normal: anim.nominative,
            gender: extractGender(char[0]),
        },
        char[1].position,
    ];
}

/**
 * Распознаёт Бабку. Её частно произносят как «баку»
 * распознаётся как »жучок»
 * @param tokens
 */
function extractBabka(tokens: Token[]): [Character, number] | undefined {
    if (tokens.some(t => t.text === 'баку')) {
        return [
            {
                normal: 'бабка',
                gender: Gender.Famela,
                subject: {
                    nominative: 'бабка',
                    accusative: 'бабку',
                },
            },
            0,
        ];
    }

    return undefined;
}

/**
 * Распознаёт Жучку. Решает проблему, когда команжа «жучка»
 * распознаётся как »жучок»
 * @param tokens
 */
function extractJuchka(tokens: Token[]): [Character, number] | undefined {
    if (tokens.some(t => t.text === 'жучка')) {
        return [
            {
                normal: 'жучка',
                gender: Gender.Famela,
                subject: {
                    nominative: 'жучка',
                    accusative: 'жучку',
                },
            },
            0,
        ];
    }

    return undefined;
}

function extractChipollino(tokens: Token[]): [Character, number] | undefined {
    if (tokens.some(t => t.text === 'чиполлино')) {
        return [
            {
                normal: 'чиполлино',
                gender: Gender.Male,
                subject: {
                    nominative: 'чиполлино',
                    accusative: 'чиполлино',
                },
            },
            0,
        ];
    }

    return undefined;
}

export function extractInanimate(tokens: Token[]): Character | undefined {
    const production = multiplyArrays(...tokens.map(t => t.lexemes));

    const SInanAcc = (l: Lexeme) => isLexemeAccept(l, [Gr.inan, Gr.S, Gr.Acc]);
    const SInanNom = (l: Lexeme) => isLexemeAccept(l, [Gr.inan, Gr.S, Gr.Nom]);

    for (let sentence of production) {
        const found = findSeq(sentence, [SInanAcc]) || findSeq(sentence, [SInanNom]);

        if (found) {
            const [char] = found;

            return {
                subject: lexemeToWord(char),
                normal: char.lex,
                gender: extractGender(char),
            };
        }
    }

    return undefined;
}
