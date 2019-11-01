import { spawn } from 'child_process';
import * as LRU from 'lru-cache';
import { Gr, Lexeme, Token } from './tokens';

//#region types
export type Stemmer = (message: string) => Promise<Token[]>;

type MyStemToken = {
    analysis?: MyStemLexeme[];
    text: string;
};

type MyStemLexeme = {
    lex: string;
    gr: string;
    wt: number;
};
//#endregion

const stemmerCache = new LRU<string, Token[]>({ max: 1024 });

export async function stemmer(message: string): Promise<Token[]> {
    const fixedMessage = fixVoiceRecognitionDefects(message);

    const cached = stemmerCache.get(fixedMessage);

    if (cached) {
        return cached;
    }

    const tokens = await stemmerImpl(fixedMessage);
    stemmerCache.set(fixedMessage, tokens);

    return tokens;
}

function stemmerImpl(message: string): Promise<Token[]> {
    if (!message) {
        return Promise.resolve([]);
    }

    const mystem = spawn('mystem', ['--format=json', '--weight', '-i']);

    const promise = new Promise<Token[]>((resolve, reject) => {
        let outDate: Buffer | undefined;

        mystem.stdout.on('data', data => {
            outDate = data;
        });

        mystem.stderr.on('data', data => {
            reject(data);
        });

        mystem.stdout.on('close', () => {
            if (!outDate) {
                resolve([]);
                return;
            }

            try {
                // В ответ почему-то добавляются симовлы «[]»
                const json = outDate.toString().replace(/\[\]/gi, '');
                const parsed = JSON.parse(json);
                const tokens = parsed.map(preprocessToken);

                resolve(tokens);
            } catch (e) {
                resolve([]);
            }
        });
    });

    const cyrillic = removeNonCyrillic(message);

    mystem.stdin.write(`${cyrillic}\n`);
    mystem.stdin.end();

    return promise;
}

function preprocessLexeme({ lex, gr, wt }: MyStemLexeme): Lexeme {
    return {
        lex,
        gr: gr.split(/=|,/) as Gr[],
        weight: wt,
        grs: [],
        tokenGrs: [],
        position: 0,
    };
}

function preprocessToken({ analysis = [], text }: MyStemToken, position: number): Token {
    const lexemes = analysis.map(preprocessLexeme);

    lexemes.forEach(l => {
        l.grs = getGrsWithSameLex(l.lex, lexemes);
        l.tokenGrs = lexemes.map(l => l.gr);
        l.position = position;
    });
    return { lexemes, text };
}

function getGrsWithSameLex(lex: string, lexemes: Lexeme[]) {
    return lexemes.filter(l => l.lex === lex).map(l => l.gr);
}

function fixVoiceRecognitionDefects(message: string) {
    // Дети случайно зовут сучку или ручку вместо жучки
    // Баку вместо баки
    return message
        .replace(/^[с|р]учк/, 'жучк')
        .replace(/\s[с|р]учк/, ' жучк')
        .replace(/детк[а|у]/, 'дедку')
        .replace(/^баку/, 'бабку')
        .replace(/\sбаку/, ' бабку');
}

/**
 * Оставляет в тексте только кирилические симводы и пробелы
 * Удаляет из текст то, что мы явно не можем обработать
 * @param message
 */
function removeNonCyrillic(message: string) {
    return message.replace(/[^а-яА-ЯёЁ ]+/g, '');
}
