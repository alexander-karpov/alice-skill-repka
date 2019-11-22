import { Stemmer } from './Stemmer';
import * as LRU from 'lru-cache';
import { Token } from './tokens';

/**
 * Добавляет lru-кэширование
 */
export class CachingStemmer implements Stemmer {
    private readonly cache: LRU<string, Token[]> = new LRU<string, Token[]>({ max: 1024 });

    constructor(private readonly stemmer: Stemmer) {}

    async analyze(message: string): Promise<Token[]> {
        const cached = this.cache.get(message);

        if (cached) {
            return cached;
        }

        const tokens = await this.stemmer.analyze(message);
        this.cache.set(message, tokens);

        return tokens;
    }
}
