//#region types
import axios from 'axios';
import { Gr, Lexeme, Token } from './tokens';
import { Stemmer } from './Stemmer';

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

export class MystemStemmer implements Stemmer {
    async analyze(message: string): Promise<Token[]> {
        if (!message) {
            return [];
        }

        const fixed = fixVoiceRecognitionDefects(message);
        const encoded = encodeURIComponent(fixed);

        const response = await axios.get<MyStemToken[]>(
            `https://functions.yandexcloud.net/d4ei9qbjvd981dqfppnc?text=${encoded}`
        );

        if (response.status !== 200 || !Array.isArray(response.data)) {
            return [];
        }

        return response.data.map(preprocessToken);
    }
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
    // Пробел вначале добавляем, чтобы не распознавать отдельно
    // начало текста. Симлов границы слова для кирилицы не работает.
    return ` ${message}`
        .replace(/\s[с|р]учк/, ' жучк')
        .replace(/\sдетк[а|у]/, ' дедку')
        .replace(/\sночк[а|у]/, ' дочка')
        .replace(/\sбаку/, ' бабку');
}
