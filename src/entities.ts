import { Token, Selection, Gr, tokenSelector } from './tokens';
import { matchSeq } from './utils/seq';

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
            return [matches[0], matches[1]];
        }
    }

    return undefined;
}
