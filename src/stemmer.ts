import * as _ from 'lodash';
import { spawn } from 'child_process';
import { Readable, Writable } from 'stream';

//#region types
export type Stemmer = (message: string) => Promise<Token[]>;

type PromiseResolvers = {
    resolve: (value: string) => void;
    reject: (reason: string) => void;
};

type MyStemToken = {
    analysis?: MyStemLexeme[];
    text: string;
};

type MyStemLexeme = { lex: string; gr: string };

export type Lexeme = { lex: string; gr: Gr[] };
export type Token = { lexemes: Lexeme[] };

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
    /** Винительный падеж */
    Acc = 'вин',
    Single = 'ед',
    Mutliple = 'мн',
    Male = 'муж',
    Famela = 'жен',
    Neuter = 'сред',
    Unisex = 'мж',
    /** Одушевленное */
    Animated = 'од',
    /** Неодушевленное */
    Inanimated = 'неод',
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
    famn = 'фам'
}
//#endregion

export function spawnMystem(): { stemmer: Stemmer; killStemmer: () => void } {
    /**
     * @see https://tech.yandex.ru/mystem/doc/
     */
    const mystem = spawn('mystem', ['--format=json', '-ig', '-c'], { detached: true });
    const queue = ReadWriteStreamsQueue.create(mystem.stdin, mystem.stdout, mystem.stderr);

    function stemmer(message: string): Promise<Token[]> {
        if (!message) {
            return Promise.resolve([]);
        }

        return queue
            .process(cleanBeforeStemming(message) + '\n')
            .then<Token[]>(output => (JSON.parse(output) as MyStemToken[]).map(preprocessToken));
    }

    function killStemmer() {
        mystem.kill();
    }

    return { stemmer, killStemmer };
}

/**
 * Позволяет упорядочить обращение к консолькой утилите mystem,
 * общение с которой происходит через запись в stdin и ожидание
 * событий stdout.
 */
export class ReadWriteStreamsQueue {
    private queue: PromiseResolvers[] = [];

    private constructor(
        private input: Writable,
        private output: Readable,
        private errors: Readable
    ) {
        this.output.on('data', data => {
            const resolvers = this.tryDequeuePromise();
            resolvers.resolve(data.toString());
        });

        this.errors.on('data', data => {
            const resolvers = this.tryDequeuePromise();
            resolvers.reject(data.toString());
        });
    }

    static create(input: Writable, output: Readable, errors: Readable) {
        return new ReadWriteStreamsQueue(input, output, errors);
    }

    process(message: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.queue.push({ resolve, reject });
            this.input.write(message);
        });
    }

    private tryDequeuePromise() {
        const resolvers = this.queue.shift();

        if (!resolvers) {
            throw new Error(
                '[ReadWriteStreamsQueue] Из output получены данные, которые не были запрошены.'
            );
        }

        return resolvers;
    }
}

/**
 * Делает список лексем плоским, помещая
 * исходный текст каждого токена внутрь.
 * @param tokens
 */
export function tokensToLexemesEx(tokens: Token[]): Lexeme[] {
    const lexemes: Lexeme[][] = tokens.map(token => token.lexemes || []);

    return _.flatten(lexemes);
}

function cleanBeforeStemming(text: string) {
    // Буква И в mystem получает очень большой набор свойств
    return text.replace(' и ', ' ');
}

export function filterLexemes(lexemes: Lexeme[], grs: Gr[]): Lexeme[] {
    return lexemes.filter(lex => matchGrs(lex.gr, grs));
}

export function matchGrs(gr: string[], pattern: Gr[]) {
    return pattern.every(p => gr.includes(p));
}

export function findLexeme(token: Token, grs: Gr[]): Lexeme | undefined {
    return token.lexemes.find(l => {
        return grs.every(gr => l.gr.includes(gr));
    });
}

function preprocessLexeme({ lex, gr }): Lexeme {
    return {
        lex,
        gr: gr.split(/=|,|\||\)|\(/) as Gr[]
    };
}

function preprocessToken({ analysis }: MyStemToken): Token {
    return { lexemes: _.map(analysis, preprocessLexeme) };
}
