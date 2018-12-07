import * as _ from 'lodash';
import { Stemmer } from './stemmer';
import { extractChar, extractInanimate } from './extractChar';
import { SessionData, Dialogs } from './sessionData';
import { Speech, createSpeech, concatSpeech } from './speech';
import * as answers from './answers';
import * as intents from './intents';

import { Character, createDedka } from './character';

//#region types
export type DialogDependencies = {
    stemmer: Stemmer;
    random100: number;
};

export type DialogResult = {
    speech: Speech;
    endSession: boolean;
};
//#endregion

export async function mainDialog(
    rawTokens: string[],
    sessionData: SessionData,
    { stemmer, random100 }: DialogDependencies
): Promise<DialogResult> {
    const isRepeatQuestionDialog = sessionData.currentDialog === Dialogs.RepeatQuestion;
    const tokens = await stemmer(rawTokens.join(' '));
    const { chars } = sessionData;

    const result = (function narrative(): DialogResult | Speech {
        if (intents.help(rawTokens)) {
            return answers.help(sessionData, random100);
        }

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

        if (intents.repka(tokens)) {
            return answers.repka(sessionData);
        }

        const nextChar = extractChar(tokens);
        const inanimate = extractInanimate(tokens);

        if (!nextChar && intents.hasMultipleChars(tokens)) {
            return answers.onlyOneCharMayCome(sessionData);
        }

        const currentChar = _.last(chars);

        if (!currentChar) {
            chars.push(createDedka());
        }

        if (sessionData.isNewSession) {
            return answers.intro(random100);
        }

        if (!currentChar) {
            return answers.storyBegin(random100);
        }

        if (!nextChar && inanimate) {
            return answers.inanimateCalled(inanimate, sessionData, random100);
        }

        if (!nextChar) {
            return answers.wrongCommand(sessionData, random100);
        }

        chars.push(nextChar);
        const repkaStory = makeRepkaStory(chars, sessionData);

        if (intents.babushka(nextChar)) {
            return concatSpeech(answers.babushka(), repkaStory);
        }

        if (intents.kot(nextChar)) {
            return concatSpeech(answers.kot(nextChar, currentChar, random100), repkaStory);
        }

        if (intents.slon(nextChar)) {
            return concatSpeech(answers.slon(random100), repkaStory);
        }

        if (intents.rybka(nextChar)) {
            return concatSpeech(answers.rybka(nextChar, currentChar), repkaStory);
        }

        return repkaStory;
    })();

    return isDialogResult(result) ? result : { speech: result, endSession: false };
}

function makeRepkaStory(all: Character[], sessionData: SessionData) {
    const story: Speech[] = [];

    story.push(formatStory(all));

    if (isStoryOver(all)) {
        story.push(
            createSpeech('— вытянули репку! Какая интересная сказка. Хочешь послушать снова?')
        );
        sessionData.currentDialog = Dialogs.RepeatQuestion;
    } else {
        story.push(concatSpeech(`вытянуть не могут.`, answers.whoCalled(sessionData)));
    }

    return concatSpeech(...story);
}

function formatStory(characters: Character[]): Speech {
    const story = _.reverse(toPairs(characters))
        .map(pair => `${answers.nom(pair[1])} за ${answers.acc(pair[0])}`)
        .join(', ');

    return createSpeech(`${_.upperFirst(story)}, дедка за репку — тянут-потянут,`);
}

function toPairs(characters: Character[]): [Character, Character][] {
    const [first, ...rest] = characters;

    if (!rest.length) {
        return [];
    }

    return [[first, rest[0]], ...toPairs(rest)];
}

function isStoryOver(chars: Character[]) {
    const last = _.last(chars);

    if (!last) {
        return false;
    }

    const isLastMouse = last.subject.nominative === 'мышка';
    const tooManyCharacters = chars.length >= 10;
    return isLastMouse || tooManyCharacters;
}

function isDialogResult(x): x is DialogResult {
    return typeof x.speech === 'object' && typeof x.endSession === 'boolean';
}
