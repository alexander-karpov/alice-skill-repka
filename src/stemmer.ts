import { Gr, Lexeme, Token } from './tokens';
import { spawn } from './spawn';
import { last } from './utils';

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
            const tokens = JSON.parse(answer).map((token, position) =>
                preprocessToken(token, position),
            );

            return removeDuplicateWords(tokens);
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
        grs: [],
        text: '',
        position: 0,
    };
}

function preprocessToken({ analysis = [], text }: MyStemToken, position: number): Token {
    const lexemes = analysis.map(preprocessLexeme);

    lexemes.forEach(l => {
        l.grs = getGrsWithSameLex(l.lex, lexemes);
        l.text = text;
        l.position = position;
    });
    return { lexemes, text };
}

function getGrsWithSameLex(lex: string, lexemes: Lexeme[]) {
    return lexemes.filter(l => l.lex === lex).map(l => l.gr);
}

/**
 * Удаляет из предложения повторяющиеся слова. Они иногда бывают.
 */
function removeDuplicateWords(tokens: Token[]): Token[] {
    const deduplicated: Token[] = [];

    for (let token of tokens) {
        const prev = last(deduplicated);

        if (!prev || prev.text !== token.text) {
            deduplicated.push(token);
        }
    }

    return deduplicated;
}
