//#region types
export type Lexeme = { text: string; lex: string; gr: Gr[]; grs: Gr[][]; position: number };
export type Token = { lexemes: Lexeme[]; text: string };

export enum Gr {
    /**
     * Прилагательное
     */
    A = 'A',
    /**
     * Наречие
     */
    ADV = 'ADV',
    /**
     * Местоименное наречие
     */
    ADVPRO = 'ADVPRO',
    /**
     * Числительное-прилагательное
     */
    ANUM = 'ANUM',
    /**
     * Местоимение-прилагательное
     */
    APRO = 'APRO',
    /**
     * Часть композита - сложного слова
     */
    COM = 'COM',
    /**
     * Союз
     */
    CONJ = 'CONJ',
    /**
     * Междометие
     */
    INTJ = 'INTJ',
    /**
     * Числительное
     */
    NUM = 'NUM',
    /**
     * Частица
     */
    PART = 'PART',
    /**
     * Предлог
     */
    PR = 'PR',
    /**
     * Существительное
     */
    S = 'S',
    /**
     * Местоимение-существительное
     */
    SPRO = 'SPRO',
    /**
     * Глагол
     */
    Verb = 'V',
    /**
     * Настоящее
     */
    Praes = 'наст',
    /**
     * Непрошедшее
     */
    Inpraes = 'непрош',
    /**
     * Прошедшее
     */
    Praet = 'прош',
    /** Именительный падеж */
    Nom = 'им',
    /** дательный */
    dat = 'дат',
    /** Винительный падеж */
    Acc = 'вин',
    single = 'ед',
    plural = 'мн',
    Male = 'муж',
    Famela = 'жен',
    Neuter = 'сред',
    Unisex = 'мж',
    /** Одушевленное */
    anim = 'од',
    /** Неодушевленное */
    inan = 'неод',
    /** вводное слово */
    parenth = 'вводн',
    /** географическое название */
    geo = 'гео',
    /** образование формы затруднено */
    awkw = 'затр',
    /** имя собственное */
    persn = 'имя',
    /** искаженная форма */
    dist = 'искаж',
    /** общая форма мужского и женского рода */
    mf = 'мж',
    /** обсценная лексика */
    obsc = 'обсц',
    /** отчество */
    patrn = 'отч',
    /** предикатив */
    praed = 'прдк',
    /** разговорная форма */
    inform = 'разг',
    /** редко встречающееся слово */
    rare = 'редк',
    /** сокращение */
    abbr = 'сокр',
    /** устаревшая форма */
    obsol = 'устар',
    /** фамилия */
    famn = 'фам',
}
//#endregion

export type Selection = [Lexeme, Token];

export function selectionToken(sel: Selection): Token {
    return sel[1];
}

export function selectionLexeme(sel: Selection): Lexeme {
    return sel[0];
}

export function selectionLemma(sel: Selection): string {
    return sel[0].lex;
}

export function matchGrs(gr: string[], pattern: Gr[]) {
    return pattern.every(p => gr.includes(p));
}

export function findLexeme(token: Token, grs: Gr[]): Lexeme | undefined {
    return token.lexemes.find(l => {
        return grs.every(gr => l.gr.includes(gr));
    });
}

export function isLexemeAccept(lexeme: Lexeme, grs: Gr[]): boolean {
    return grs.every(gr => lexeme.gr.includes(gr));
}

export function isLexemeGrsAccept(lexeme: Lexeme, grs: Gr[]): boolean {
    return grs.every(gr => lexeme.grs.some(lgr => lgr.includes(gr)));
}

export function findLemma(token: Token, grs: Gr[], lemma: string): Lexeme | undefined {
    return token.lexemes.find(l => {
        return grs.every(gr => l.gr.includes(gr) && l.lex === lemma);
    });
}

export function tokenSelector(...orPatterns: (Gr[])[]) {
    return function selector(token: Token): Selection | undefined {
        for (let pattern of orPatterns) {
            const found = findLexeme(token, pattern);
            if (found) return [found, token] as Selection;
        }

        return undefined;
    };
}
