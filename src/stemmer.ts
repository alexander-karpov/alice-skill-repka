import { Token } from './tokens';

export interface Stemmer {
    analyze(message: string): Promise<Token[]>;
}
