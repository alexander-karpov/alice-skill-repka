import * as child_process from 'child_process';
import * as readline from 'readline';
import { Action } from './core';

type SpawnedProcess = {
    send: (message: string) => Promise<string>;
    kill: () => void;
};

export function spawn(name: string, ...args: string[]): SpawnedProcess {
    const proc = child_process.spawn(name, args, { detached: true });

    const rl = readline.createInterface({
        input: proc.stdout,
        output: proc.stdin,
    });

    const input = new AsyncQueue<string>();
    const output = new AsyncQueue<string>();

    function process(message: string) {
        return new Promise<string>(resolve => {
            rl.question(message + '\n', resolve);
        });
    }

    /**
     * Такая хитрость нужна, чтобы в процесс уходило
     * не больше одного сообщения за раз.
     */
    async function processLoop() {
        // tslint:disable-next-line: no-constant-condition
        while (true) {
            const message = await input.dequeue();
            const answer = await process(message);
            output.enqueue(answer);
        }
    }

    processLoop();

    return {
        send(message: string) {
            input.enqueue(message);
            return output.dequeue();
        },
        kill() {
            rl.close();
            proc.kill();
        },
    };
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
