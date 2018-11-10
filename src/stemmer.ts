import { spawn } from 'child_process';
import { Readable, Writable } from 'stream';

//#region types
export type Stemmer = (message: string) => Promise<Token[]>;

type PromiseResolvers = {
    resolve: (value: string) => void;
    reject: (reason: string) => void;
};

export type Token = {
    analysis?: Lexeme[];
    text: string;
};

export type Lexeme = { lex: string; gr: string };

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
    /** Винительный падеж */
    Accusative = 'вин',
    Male = 'муж',
    Famela = 'жен',
    Neuter = 'сред'
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

        return queue.process(message + '\n').then<Token[]>(output => JSON.parse(output));
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
