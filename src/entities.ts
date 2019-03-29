import { matchSeq } from './utils/seq';

import {
    findLemma,
    Gr,
    Selection,
    selectionLemma,
    selectionLexeme,
    selectionToken,
    Token,
    tokenSelector,
} from './tokens';

/**  Милый конь, милые кони */
export function extractASAnim(tokens: Token[]): [Selection, Selection] | undefined {
    for (let number of [Gr.single, Gr.plural]) {
        for (let _case of [Gr.Acc, Gr.Nom]) {
            const A = tokenSelector([Gr.A, _case, number]);
            const S = tokenSelector([Gr.S, Gr.anim, _case, number]);

            const matches = matchSeq(tokens, [A, S]);

            if (matches) {
                return [matches[0], matches[1]];
            }
        }
    }

    return undefined;
}

/** мальчика, мальчик, мальчику */
export function extractSAnim(tokens: Token[]): Selection | undefined {
    for (let number of [Gr.single, Gr.plural]) {
        for (let _case of [Gr.Acc, Gr.Nom, Gr.dat]) {
            const S = tokenSelector([Gr.S, Gr.anim, _case, number]);
            const matches = matchSeq(tokens, [S]);

            if (matches) {
                return matches[0];
            }
        }
    }

    return undefined;
}

export function extractSAnimSInan(tokens: Token[]): [Selection, Selection] | undefined {
    for (let _case of [Gr.Acc, Gr.Nom, Gr.dat]) {
        const SAnim = tokenSelector([Gr.S, Gr.anim, _case, Gr.single]);
        const SInan = tokenSelector([Gr.S, _case, Gr.single]);

        const matches = matchSeq(tokens, [SAnim, SInan]);

        if (matches) {
            const [sAnim, s] = matches;
            const isSecondWordA = findLemma(selectionToken(s), [Gr.A], selectionLexeme(s).lex);

            /**
             * Отбрасывает варианты где второе слово - прилагательное тоже.
             * Напр. "Собака красный".
             */
            if (isSecondWordA) {
                return undefined;
            }

            /**
             * Отбрасывает повторение одного слова (иногда случайно так получается)
             * Напр. "Чебурашку чебурашку".
             */
            if (selectionLemma(sAnim) === selectionLemma(s)) {
                return undefined;
            }

            return [sAnim, s];
        }
    }

    return undefined;
}
