import { spawn } from 'child_process';
import PhraseAnalysis from './PhraseAnalysis';
import { Readable, Writable } from 'stream';

//#region types
export type Stemmer = (message: string) => Promise<PhraseAnalysis>;

type PromiseResolvers = {
    resolve: (value: string) => void;
    reject: (reason: string) => void;
};
//#endregion

export function spawnMystem(): { stemmer: Stemmer; killStemmer: () => void } {
    /**
     * @see https://tech.yandex.ru/mystem/doc/
     */
    const mystem = spawn('mystem', ['--format=json', '-ig', '-c']);
    const queue = ReadWriteStreamsQueue.create(mystem.stdin, mystem.stdout, mystem.stderr);

    function stemmer(message: string): Promise<PhraseAnalysis> {
        if (!message) {
            return Promise.resolve(PhraseAnalysis.createEmpty());
        }

        return queue
            .process(message + '\n')
            .then(output => PhraseAnalysis.create(JSON.parse(output)));
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
