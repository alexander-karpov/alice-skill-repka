import * as _ from 'lodash';
import { spawn } from 'child_process';
import { Readable, Writable } from 'stream';
import { Token, Gr, Lexeme } from './tokens';

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
//#endregion

export function spawnMystem(): { stemmer: Stemmer; killStemmer: () => void } {
    /**
     * @see https://tech.yandex.ru/mystem/doc/
     */
    const mystem = spawn('mystem', ['--format=json', '-i'], { detached: true });
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

function cleanBeforeStemming(text: string) {
    // Буква И в mystem получает очень большой набор свойств
    return text.replace(' и ', ' ');
}

function preprocessLexeme({ lex, gr }): Lexeme {
    return {
        lex,
        gr: gr.split(/=|,/) as Gr[]
    };
}

function preprocessToken({ analysis, text }: MyStemToken): Token {
    return { lexemes: _.map(analysis, preprocessLexeme), text };
}
