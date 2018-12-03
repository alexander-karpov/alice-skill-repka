import * as _ from 'lodash';
import { Stemmer, tokensToLexemesEx } from './stemmer';
import { extractCharacter, createDedka, extractInanimate } from './extractCharacter';
import { SessionData, Dialogs } from './sessionData';
import { Speech, createSpeech, concatSpeech } from './speech';
import * as answers from './answers';
import * as intents from './intents';

import { Character, isCharMale, isCharFamela, charNominative, charAccusative } from './character';

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
    const lexemes = tokensToLexemesEx(tokens);
    const { chars } = sessionData;

    const result = await (async function narrative(): Promise<DialogResult | Speech> {
        if (intents.help(rawTokens)) {
            return answers.help(sessionData);
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

        if (intents.repka(lexemes)) {
            return answers.repka(sessionData);
        }

        const nextChar = extractCharacter(tokens, lexemes);
        const inanimate = extractInanimate(lexemes);

        if (!nextChar && intents.hasMultipleChars(lexemes)) {
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
            return answers.wrongCommand(sessionData);
        }

        chars.push(nextChar);
        const repkaStory = makeRepkaStory(nextChar, chars, sessionData);

        if (intents.babushka(nextChar)) {
            return concatSpeech(answers.babushka(), repkaStory);
        }

        if (intents.kot(nextChar)) {
            return concatSpeech(answers.kot(nextChar, sessionData, random100), repkaStory);
        }

        if (intents.slon(nextChar)) {
            return concatSpeech(answers.slon(random100), repkaStory);
        }

        if (intents.rybka(nextChar)) {
            return concatSpeech(answers.rybka(currentChar), repkaStory);
        }

        if (intents.sobaka(nextChar)) {
            return concatSpeech(answers.sobaka(nextChar, currentChar, random100), repkaStory);
        }

        return repkaStory;
    })();

    return isDialogResult(result) ? result : { speech: result, endSession: false };
}

function makeRepkaStory(next: Character, all: Character[], sessionData: SessionData) {
    const story: Speech[] = [];

    story.push(formatStory(all));

    if (isStoryOver(all)) {
        story.push(
            createSpeech('— вытянули репку! Какая интересная сказка. Хочешь послушать снова?')
        );
        sessionData.currentDialog = Dialogs.RepeatQuestion;
    } else {
        story.push(concatSpeech(`вытянуть не могут.`, formatCall(next)));
    }

    return concatSpeech(...story);
}

function formatStory(characters: Character[]): Speech {
    const story = _.reverse(toPairs(characters))
        .map(pair => `${charNominative(pair[1])} за ${charAccusative(pair[0])}`)
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

function formatCall(char: Character) {
    return _.capitalize(`${formatCallWord(char)} ${charNominative(char)}...`);
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

function formatCallWord(char: Character) {
    return isCharMale(char) ? 'позвал' : isCharFamela(char) ? 'позвала' : 'позвало';
}

function isDialogResult(x): x is DialogResult {
    return typeof x.speech === 'object' && typeof x.endSession === 'boolean';
}
