import * as _ from 'lodash';
import { spawn } from 'child_process';
import { Readable, Writable } from 'stream';

//#region types
export type Stemmer = (message: string) => Promise<Lexeme[]>;

type PromiseResolvers = {
    resolve: (value: string) => void;
    reject: (reason: string) => void;
};

type Token = {
    analysis?: TokenLexeme[];
    text: string;
};

type TokenLexeme = { lex: string; gr: string };

export type Lexeme = { lex: string; gr: Gr[]; text: string };

export enum Gr {
    /**
     * Прилагательное
     */
    Adjective = 'A',
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
    Noun = 'S',
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
    Nominative = 'им',
    /** Винительный падеж */
    Accusative = 'вин',
    Single = 'ед',
    Mutliple = 'мн',
    Male = 'муж',
    Famela = 'жен',
    Neuter = 'сред',
    /** Одушевленное */
    Animated = 'од'
}
//#endregion

export function spawnMystem(): { stemmer: Stemmer; killStemmer: () => void } {
    /**
     * @see https://tech.yandex.ru/mystem/doc/
     */
    const mystem = spawn('mystem', ['--format=json', '-ig', '-c'], { detached: true });
    const queue = ReadWriteStreamsQueue.create(mystem.stdin, mystem.stdout, mystem.stderr);

    function stemmer(message: string): Promise<Lexeme[]> {
        if (!message) {
            return Promise.resolve([]);
        }

        return queue
            .process(cleanBeforeStemming(message) + '\n')
            .then<Lexeme[]>(output => tokensToLexemesEx(JSON.parse(output)));
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
function tokensToLexemesEx(tokens: Token[]): Lexeme[] {
    function clean(raw: string) {
        return raw.toLowerCase().replace('ё', 'е');
    }

    const lexemes: Lexeme[][] = tokens.map(token =>
        (token.analysis || []).map(lex => ({
            lex: lex.lex,
            gr: lex.gr.split(/=|,|\||\(/) as Gr[],
            text: clean(token.text)
        }))
    );

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
