'use strict';

const readline = require('readline');
const child_process_1 = require('child_process');
const _ = require('lodash');

//#endregion
function spawnMystem() {
    /** @see https://tech.yandex.ru/mystem/doc/ */
    const mystem = child_process_1.spawn('mystem', ['-c', '-l', '-d'], {
        detached: true,
    });
    const rl = readline.createInterface({
        input: mystem.stdout,
        output: mystem.stdin,
    });
    const input = new AsyncQueue();
    const output = new AsyncQueue();
    /** Прогоняет текст через mystem */
    function process(message) {
        return new Promise(resolve => {
            const preparedMessage = cleanBeforeStemming(message) + '\n';
            rl.question(preparedMessage, resolve);
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
    function stemmer(message) {
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
exports.spawnMystem = spawnMystem;
class AsyncQueue {
    constructor() {
        this.resolves = [];
        this.queue = [];
    }
    enqueue(item) {
        const resolve = this.resolves.shift();
        if (resolve) {
            resolve(item);
        } else {
            this.queue.push(item);
        }
    }
    dequeue() {
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
function cleanBeforeStemming(text) {
    // Буква И в mystem получает очень большой набор свойств
    return text.replace(' и ', ' ').replace(' с ', ' ');
}
