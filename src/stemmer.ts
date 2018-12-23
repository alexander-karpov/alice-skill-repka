import * as readline from 'readline';
import { spawn } from 'child_process';
import * as _ from 'lodash';
import { Token, Gr, Lexeme } from './tokens';
import { Action } from './core';

//#region types
export type Stemmer = (message: string) => Promise<Token[]>;

type MyStemToken = {
    analysis?: MyStemLexeme[];
    text: string;
};

type MyStemLexeme = { lex: string; gr: string };
//#endregion

export function spawnMystem(): { stemmer: Stemmer; killStemmer: () => void } {
    /** @see https://tech.yandex.ru/mystem/doc/ */
    const mystem = spawn('mystem', ['--format=json', '-i'], { detached: true });

    const rl = readline.createInterface({
        input: mystem.stdout,
        output: mystem.stdin,
    });

    const input = new AsyncQueue<string>();
    const output = new AsyncQueue<Token[]>();

    /** Прогоняет текст через mystem */
    function process(message: string) {
        return new Promise<Token[]>(resolve => {
            const preparedMessage = cleanBeforeStemming(message) + '\n';

            rl.question(preparedMessage, answer => {
                const tokens = JSON.parse(answer).map(preprocessToken);
                resolve(tokens);
            });
        });
    }

    /**
     * Такая хитрость нужна, чтобы в mystem уходило
     * не больше одного сообщения за раз. Иначе оно ломается.
     */
    async function processLoop() {
        while (true) {
            const message = await input.dequeue();
            const tokens = await process(message);
            output.enqueue(tokens);
        }
    }

    function stemmer(message: string) {
        input.enqueue(message);
        return output.dequeue();
    }

    processLoop();

    function killStemmer() {
        rl.close();
        mystem.kill();
    }

    return { stemmer, killStemmer };
}

class AsyncQueue<TItem> {
    private resolves: Action<TItem>[] = [];
    private queue: TItem[] = [];

    enqueue(item: TItem) {
        const resolve = this.resolves.shift();

        if (resolve) {
            resolve(item);
        } else {
            this.queue.push(item);
        }
    }

    dequeue(): Promise<TItem> {
        const item = this.queue.shift();

        if (item && this.resolves.length) {
            throw new Error('PromiseQueue.dequeue inconsistent queue and resolves.');
        }

        if (item) {
            return Promise.resolve(item);
        }

        return new Promise(resolve => this.resolves.push(resolve));
    }
}

function cleanBeforeStemming(text: string) {
    // Буква И в mystem получает очень большой набор свойств
    return text.replace(' и ', ' ').replace(' с ', ' ');
}

function preprocessLexeme({ lex, gr }: MyStemLexeme): Lexeme {
    return {
        lex,
        gr: gr.split(/=|,/) as Gr[],
    };
}

function preprocessToken({ analysis, text }: MyStemToken): Token {
    return { lexemes: _.map(analysis, preprocessLexeme), text };
}
