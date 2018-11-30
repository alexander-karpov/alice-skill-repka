import * as _ from 'lodash';
import { Character, Word, Gender } from './character';
import { Lexeme, Gr, filterLexemes } from './stemmer';

export function extractCharacter(lexemes: Lexeme[]): Character | undefined {
    const animated = filterLexemes(lexemes, [Gr.Animated]);
    const nouns = filterLexemes(animated, [Gr.Noun]);
    const nounAccusative = _.last(filterLexemes(nouns, [Gr.Accusative, Gr.Single]));

    if (nounAccusative) {
        return {
            subject: lexemeToWord(nounAccusative),
            gender: extractGender(nounAccusative)
        };
    }

    // const nounNominative = _.last(filterLexemes(nouns, [Gr.Nominative, Gr.Single]));

    // if (nounNominative) {

    // }

    return undefined;
}

export function createDedka(): Character {
    return {
        subject: { nominative: 'дедка', accusative: 'дедку' },
        gender: Gender.Male
    };
}

function lexemeToWord(lexeme: Lexeme): Word {
    const accusative = lexeme.text;

    return {
        nominative: lexeme.lex,
        accusative
    };
}

function extractGender(lexeme: Lexeme): Gender {
    if (lexeme.gr.includes(Gr.Male)) {
        return Gender.Male;
    }

    if (lexeme.gr.includes(Gr.Famela)) {
        return Gender.Famela;
    }

    return Gender.Neuter;
}

// /**
//  * Меняет падеж существительного с им. на вин.
//  * @param noun Существительное в им. падеже.
//  */
// function nominativeToAccusative(noun:string) {
//     if (noun.endsWith('a')) {} {

//     }
// }
