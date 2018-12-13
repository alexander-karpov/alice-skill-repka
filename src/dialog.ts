import * as _ from 'lodash';
import { Stemmer } from './stemmer';
import { extractChar, extractInanimate } from './extractChar';
import { SessionData, Dialogs } from './sessionData';
import { Speech, concatSpeech, createSpeech } from './speech';
import * as answers from './answers';
import * as intents from './intents';
import { findKnownChar, chooseKnownCharButtons } from './knownChars';

import { Character, createDedka } from './character';

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

type DialogButton = {
    title: string;
    url?: string;
    hide?: boolean;
};
//#endregion

export async function mainDialog(
    rawTokens: string[],
    sessionData: SessionData,
    { stemmer, random100 }: DialogDependencies,
): Promise<DialogResult> {
    const isRepeatQuestionDialog = sessionData.currentDialog === Dialogs.RepeatQuestion;
    const tokens = await stemmer(rawTokens.join(' '));
    const { chars } = sessionData;

    const result = (function narrative(): DialogResult | Speech {
        if (isRepeatQuestionDialog && !intents.no(rawTokens) && !intents.yes(rawTokens)) {
            return answers.yesOrNoExpected();
        }

        if (isRepeatQuestionDialog && intents.no(rawTokens)) {
            return { speech: answers.endOfStory(), endSession: true };
        }

        if (isRepeatQuestionDialog && intents.yes(rawTokens)) {
            sessionData.chars.length = 0;
            sessionData.currentDialog = Dialogs.Story;
        }

        if (intents.help(rawTokens)) {
            return answers.help(sessionData);
        }

        const currentChar = _.last(chars);

        if (!currentChar) {
            chars.push(createDedka());
        }

        if (sessionData.isNewSession) {
            return answers.intro(random100);
        }

        if (!currentChar) {
            return answers.storyBegin();
        }

        const nextChar = extractChar(tokens);
        const inanimate = extractInanimate(tokens);

        if (!nextChar && inanimate) {
            return {
                speech: answers.inanimateCalled(inanimate, currentChar),
                buttons: makeButtons(chars, random100),
                endSession: false,
            };
        }

        if (!nextChar) {
            return {
                speech: answers.wrongCommand(sessionData),
                buttons: makeButtons(chars, random100),
                endSession: false,
            };
        }

        chars.push(nextChar);
        const tale = makeRepkaStory(chars, nextChar);

        if (isEndOfStory(chars)) {
            sessionData.currentDialog = Dialogs.RepeatQuestion;
        }

        const knownChar = findKnownChar(nextChar);

        if (knownChar) {
            // Ограничение поля card/description - 254
            const isTaleFitsImageDisc = tale.text.length <= 253;
            const knownCharAnswer = knownChar.answer(nextChar, currentChar, random100);
            const knownCharTts = createSpeech('', knownCharAnswer.tts);

            if (isTaleFitsImageDisc && knownChar.image) {
                return {
                    speech: concatSpeech(knownCharTts, tale),
                    imageId: knownChar.image,
                    buttons: makeButtons(chars, random100),
                    endSession: false,
                };
            }

            return {
                speech: concatSpeech(knownCharAnswer, tale),
                imageId: '',
                buttons: makeButtons(chars, random100),
                endSession: false,
            };
        }

        return {
            speech: tale,
            buttons: makeButtons(chars, random100),
            endSession: false,
        };
    })();

    return isDialogResult(result) ? result : { speech: result, endSession: false };
}

function makeRepkaStory(all: Character[], char: Character) {
    return concatSpeech(
        answers.formatStory(all),
        isEndOfStory(all) ? answers.success() : answers.failure(char),
    );
}

function isEndOfStory(chars: Character[]) {
    const last = _.last(chars);

    if (!last) {
        return false;
    }

    const isLastMouse = last.normal.startsWith('мыш');
    const tooManyCharacters = chars.length >= 10;
    return isLastMouse || tooManyCharacters;
}

function isDialogResult(x): x is DialogResult {
    return typeof x.speech === 'object' && typeof x.endSession === 'boolean';
}

function makeButtons(chars: Character[], random100: number): DialogButton[] {
    // Дадим ребенку сначала понять, что можно
    // самому придумывать персонажей.
    if (chars.length < 3) {
        return [];
    }

    if (isEndOfStory(chars)) {
        return [{ title: 'Да', hide: true }, { title: 'Нет', hide: true }, feedbackButton()];
    }

    return chooseKnownCharButtons(chars, random100).map(text => ({
        title: text,
        hide: true,
    }));
}

function feedbackButton(): DialogButton {
    return {
        title: 'Поставить оценку',
        url: 'https://dialogs.yandex.ru/store/skills/916a8380-skazka-pro-repku',
        hide: false,
    };
}
