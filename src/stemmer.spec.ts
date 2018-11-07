import { spawnMystem, ReadWriteStreamsQueue } from './stemmer';
import { EventEmitter } from 'events';

describe('Stemmer', () => {
    const { stemmer, killStemmer } = spawnMystem();

    test('возвращает основу слова', async () => {
        const tokens = await stemmer('на дворе 42');

        expect(tokens.hasNoun('двор')).toBe(true);
        expect(tokens.hasNumber()).toBe(true);
    });

    afterAll(() => {
        killStemmer();
    });
});

describe('ReadWriteStreamsQueue', () => {
    function createQueue() {
        const output = new EventEmitter();
        const errors = new EventEmitter();

        const queue = ReadWriteStreamsQueue.create(
            { write() {} } as any,
            output as any,
            errors as any
        );

        return { output, errors, queue };
    }

    test('Возвращает результат в случае одного запроса', async () => {
        const { output, queue } = createQueue();

        const first = queue.process('');
        output.emit('data', 'first');

        expect(await first).toBe('first');
    });

    test('Возвращает результаты в правильном порядке в случае двух одновременных запросов', async () => {
        const { output, queue } = createQueue();

        const first = queue.process('');
        const second = queue.process('');

        output.emit('data', 'first');
        output.emit('data', 'second');

        expect(await first).toBe('first');
        expect(await second).toBe('second');
    });

    test('Падает если получает данные, которые не были запрошены', async () => {
        const { output, errors } = createQueue();

        expect(() => output.emit('data', 'first')).toThrow(/не были запрошены/);
        expect(() => errors.emit('data', 'first')).toThrow(/не были запрошены/);
    });

    test('Возвращает ошибку если получает данные из потока ошибок', done => {
        const { errors, queue } = createQueue();

        queue.process('').catch(error => {
            expect(error).toBe('Сообщение об ошибке');
            done();
        });

        errors.emit('data', 'Сообщение об ошибке');
    });
});
