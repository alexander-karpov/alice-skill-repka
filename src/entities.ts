import { Token, Selection, Gr, tokenSelector } from './tokens';
import { matchSeq } from './utils/seq';

/**  Милый кони */
export function extractASAnim(tokens: Token[]): Selection[] | undefined {
    for (let number of [Gr.single, Gr.plural]) {
        for (let _case of [Gr.Acc, Gr.Nom]) {
            const A = tokenSelector([Gr.A, _case, number]);
            const S = tokenSelector([Gr.S, Gr.anim, _case, number]);

            const matches = matchSeq(tokens, [A, S]);

            if (matches) {
                return matches;
            }
        }
    }

    return undefined;
}
