//#region types
export type Lexeme = {
    text: string;
    lex: string;
    gr: Gr[];
    tokenGrs: Gr[][];
    grs: Gr[][];
    position: number;
};
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

export function isLexemeAccept(lexeme: Lexeme, grs: Gr[]): boolean {
    return grs.every(gr => lexeme.gr.includes(gr));
}

export function isLexemeGrsAccept(lexeme: Lexeme, grs: Gr[]): boolean {
    return grs.every(gr => lexeme.grs.some(lgr => lgr.includes(gr)));
}
export function isTokenAccept(lexeme: Lexeme, grs: Gr[]): boolean {
    return grs.every(gr => lexeme.tokenGrs.some(lgr => lgr.includes(gr)));
}
