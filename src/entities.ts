import { findSeq } from './utils/seq';
import { multiplyArrays } from './utils/multiplyArrays';

import { Gr, Token, isLexemeAccept, Lexeme, isLexemeGrsAccept } from './tokens';

/**  Милый конь, милые кони */
export function extractASAnim2(tokens: Token[]): [Lexeme, Lexeme] | undefined {
    const production = multiplyArrays(...tokens.map(t => t.lexemes));

    for (let number of [Gr.single, Gr.plural]) {
        for (let _case of [Gr.Acc, Gr.Nom]) {
            const A = (l: Lexeme) => isLexemeAccept(l, [Gr.A, _case, number]);
            const S = (l: Lexeme) => isLexemeAccept(l, [Gr.S, Gr.anim, _case, number]);

            for (let sentence of production) {
                const matches = findSeq(sentence, [A, S]);

                if (matches && matches[0] && matches[1]) {
                    return [matches[0], matches[1]];
                }
            }
        }
    }

    const A = (l: Lexeme) => isLexemeAccept(l, [Gr.A]);
    const S = (l: Lexeme) => isLexemeAccept(l, [Gr.S]);

    for (let sentence of production) {
        const matches = findSeq(sentence, [A, S]);

        if (matches && matches[0] && matches[1]) {
            return [matches[0], matches[1]];
        }
    }

    return undefined;
}

/** мальчика, мальчик, мальчику */
export function extractSAnim(tokens: Token[]): Lexeme | undefined {
    const production = multiplyArrays(...tokens.map(t => t.lexemes));

    for (let number of [Gr.single, Gr.plural]) {
        for (let _case of [Gr.Acc, Gr.Nom, Gr.dat]) {
            const S = (l: Lexeme) => isLexemeAccept(l, [Gr.S, Gr.anim, _case, number]);

            for (let sentence of production) {
                const matches = findSeq(sentence, [S]);

                if (matches && matches[0]) {
                    return matches[0];
                }
            }
        }
    }

    return undefined;
}

export function extractSAnimSInan(tokens: Token[]): [Lexeme, Lexeme] | undefined {
    const production = multiplyArrays(...tokens.map(t => t.lexemes));

    for (let _case of [Gr.Acc, Gr.Nom, Gr.dat]) {
        const SAnim = (l: Lexeme) => isLexemeAccept(l, [Gr.S, Gr.anim, _case, Gr.single]);
        const SInan = (l: Lexeme) => isLexemeAccept(l, [Gr.S, _case, Gr.single]);

        for (let sentence of production) {
            const matches = findSeq(sentence, [SAnim, SInan]);

            if (matches && matches[0] && matches[1]) {
                const [sAnim, s] = matches;
                const isSecondWordA = isLexemeGrsAccept(s, [Gr.A]);

                /**
                 * Отбрасывает варианты где второе слово - прилагательное тоже.
                 * Напр. "Собака красный".
                 */
                if (isSecondWordA) {
                    return undefined;
                }

                return [sAnim, s];
            }
        }
    }

    return undefined;
}
