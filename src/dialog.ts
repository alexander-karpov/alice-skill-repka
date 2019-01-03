import * as _ from 'lodash';
import { Stemmer } from './stemmer';
import { SessionData } from './sessionData';
import { Speech, speak } from './speech';
import * as intents from './intents';
import { scenes } from './scene';
import { whoCalled2 } from './answers';
import { Character } from './character';

//#region types
export type DialogDependencies = {
    stemmer: Stemmer;
    random100: number;
};

export type DialogResult = {
    speech: Speech;
    imageId?: string;
    buttons?: DialogButton[];
    endSession: boolean;
};

export type DialogButton = {
    title: string;
    url?: string;
    hide?: boolean;
};
//#endregion

export async function mainDialog(
    command: string,
    sessionData: SessionData,
    { stemmer, random100 }: DialogDependencies,
): Promise<DialogResult> {
    const tokens = await stemmer(command);
    const { chars } = sessionData;
    const char = _.last(chars) as Character;

    if (intents.help(tokens)) {
        return {
            speech: speak(
                'В этой игре мы вместе сочиним сказку про репку.',
                'Называйте персонажей и слушайте получившуюся историю.',
                whoCalled2(char),
            ),
            endSession: false,
        };
    }

    const res = scenes[sessionData.scene]({ chars, tokens, random100, mode: sessionData.mode });

    if (res.chars) {
        sessionData.chars = res.chars;
    }

    if (res.next) {
        sessionData.scene = res.next;
    }

    if (res.mode) {
        sessionData.mode = res.mode;
    }

    return { speech: res.speech, endSession: !!res.endSession };
}
