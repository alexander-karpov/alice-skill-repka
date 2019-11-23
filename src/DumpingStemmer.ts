import { Stemmer } from './Stemmer';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Token } from './tokens';

/**
 * Добавляет кэширование на файловую систему
 */
export class DumpingStemmer implements Stemmer {
    constructor(private readonly stemmer: Stemmer) {}

    async analyze(message: string): Promise<Token[]> {
        const dumpFileName = this.makeFileName(message);
        const dumpPath = path.resolve('.', 'stemmer-dumps', `${dumpFileName}.json`);

        if (fs.existsSync(dumpPath)) {
            const content = fs.readFileSync(dumpPath).toString('utf8');
            return JSON.parse(content);
        }

        const tokens = await this.stemmer.analyze(message);
        fs.writeFileSync(dumpPath, JSON.stringify(tokens));

        return tokens;
    }

    private makeFileName(message: string): string {
        const md5sum = crypto.createHash('md5');
        md5sum.update(message);
        return md5sum.digest('hex');
    }
}
