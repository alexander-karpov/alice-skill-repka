import { spawn } from 'child_process';
import { Gr, Lexeme, Token } from './tokens';
import { last } from './utils';

//#region types
export type Stemmer = (message: string) => Promise<Token[]>;

type MyStemToken = {
    analysis?: MyStemLexeme[];
    text: string;
};

type MyStemLexeme = { lex: string; gr: string };
//#endregion

export function stemmer(message: string): Promise<Token[]> {
    if (!message) {
        return Promise.resolve([]);
    }

    const mystem = spawn('mystem', ['--format=json', '-i']);

    const promise = new Promise<Token[]>((resolve, reject) => {
        mystem.stdout.on('data', data => {
            // В ответ почему-то добавляются симовлы «[]»
            const answer = data.toString().replace(/\[\]/gi, '');

            try {
                const tokens = JSON.parse(answer).map((token, position) =>
                    preprocessToken(token, position),
                );

                return resolve(removeDuplicateWords(tokens));
            } catch (e) {
                resolve([]);
            }
        });

        mystem.stderr.on('data', data => {
            reject(data);
        });
    });

    mystem.stdin.write(`${fixSpeechRecognitionIssues(removeNonCyrillic(message))}\n`);
    mystem.stdin.end();

    return promise;
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

/**
 * Оставляет в тексте только кирилические симводы и пробелы
 * Удаляет из текст то, что мы явно не можем обработать
 * @param message
 */
function removeNonCyrillic(message: string) {
    return message.replace(/[^а-яА-ЯёЁ ]+/g, '');
}

function fixSpeechRecognitionIssues(message: string) {
    return message.replace(/сучк/gi, 'жучк');
}
