/**
 * @see https://tech.yandex.ru/mystem/doc/grammemes-values-docpage/
 */
import * as _ from 'lodash';

type WordAnalysis = {
    analysis?: Lexeme[];
    text: string;
};

type Lexeme = { lex: string; gr: string };

export default class PhraseAnalysis {
    private constructor(private data: WordAnalysis[]) { }

    public static create(data: WordAnalysis[]) {
        return new PhraseAnalysis(data);
    }

    public static createEmpty() {
        return new PhraseAnalysis([]);
    }

    findNouns() {
        return this.findLemmas(Gr.Noun);
    }

    hasLemma(lemma: string, ...grs: Gr[]) {
        if (grs.length === 0) {
            return this.lexemes(lemma).length > 0;
        }

        return this.lexemes(lemma).some(lex => isLexemeMatchesGr(lex, grs));
    }

    hasNoun(lemma: string) {
        return this.hasLemma(lemma, Gr.Noun);
    }

    hasPretext(lemma: string) {
        return this.hasLemma(lemma, Gr.PR);
    }

    hasVerb(lemma: string) {
        return this.hasLemma(lemma, Gr.Verb);
    }

    hasNumber() {
        return this.findNumber() != null;
    }

    findNumber() {
        return this.text().find(text => Boolean(text.match(/\d+/)));
    }

    private findLemmas(...grs: Gr[]) {
        return this.lexemes().filter(lex => isLexemeMatchesGr(lex, grs)).map(lexeme => lexeme.lex);
    }

    private lexemes(lemma?: string) {
        const analysis = this.data.map(word => word.analysis || []);
        const lexemes = _.flatten(analysis);

        if (lemma) {
            return lexemes.filter(lex => lex.lex === lemma);
        }

        return lexemes;
    }

    private text() {
        return _.flatten(this.data.map(word => word.text));
    }
}

function isLexemeMatchesGr(lexeme: Lexeme, grs: Gr[]) {
    return grs.every(gr => lexeme.gr.includes(gr));
}

export enum Gr {
    /**
     * Прилагательное
     */
    A = 'A',
    /**
     * Наречие
     */
    ADV = 'ADV',
    /**
     * Местоименное наречие
     */
    ADVPRO = 'ADVPRO',
    /**
     * Числительное-прилагательное
     */
    ANUM = 'ANUM',
    /**
     * Местоимение-прилагательное
     */
    APRO = 'APRO',
    /**
     * Часть композита - сложного слова
     */
    COM = 'COM',
    /**
     * Союз
     */
    CONJ = 'CONJ',
    /**
     * Междометие
     */
    INTJ = 'INTJ',
    /**
     * Числительное
     */
    NUM = 'NUM',
    /**
     * Частица
     */
    PART = 'PART',
    /**
     * Предлог
     */
    PR = 'PR',
    /**
     * Существительное
     */
    Noun = 'S',
    /**
     * Местоимение-существительное
     */
    SPRO = 'SPRO',
    /**
     * Глагол
     */
    Verb = 'V',
    /**
     * Настоящее
     */
    Praes = 'наст',
    /**
     * Непрошедшее
     */
    Inpraes = 'непрош',
    /**
     * Прошедшее
     */
    Praet = 'прош'
}
