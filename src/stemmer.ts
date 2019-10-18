import { Gr, Lexeme, Token } from './tokens';
import { spawn } from './spawn';

//#region types
export type Stemmer = (message: string) => Promise<Token[]>;

type MyStemToken = {
    analysis?: MyStemLexeme[];
    text: string;
};

type MyStemLexeme = { lex: string; gr: string };
//#endregion

export function spawnMystem(): { stemmer: Stemmer; killStemmer: () => void } {
    // @see https://tech.yandex.ru/mystem/doc/
    const mystem = spawn('mystem', '--format=json', '-i');

    return {
        async stemmer(message) {
            const answer = await mystem.send(message);
            return JSON.parse(answer).map(preprocessToken);
        },
        killStemmer() {
            mystem.kill();
        },
    };
}

function preprocessLexeme({ lex, gr }: MyStemLexeme): Lexeme {
    return {
        lex,
        gr: gr.split(/=|,/) as Gr[],
    };
}

function preprocessToken({ analysis = [], text }: MyStemToken): Token {
    return { lexemes: analysis.map(preprocessLexeme), text };
}
