import * as _ from 'lodash';
import { Stemmer } from './stemmer';
import { extractCharacter, createDedka } from './extractCharacter';
import { SessionData, Dialogs } from './sessionData';
import { Speech, speech, joinSpeech, concatSpeech } from './speech';
import * as answers from './answers';
import * as intents from './intents';

import {
    Character,
    isCharMale,
    isCharFamela,
    formatCharNominative,
    formatCharAccusative
} from './character';

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
    command: string[],
    sessionData: SessionData,
    deps: DialogDependencies
): Promise<DialogResult> {
    const commandText = command.join(' ');

    if (commandText === 'что ты умеешь' || commandText === 'помощь') {
        return { speech: answers.help(sessionData), endSession: false };
    }

    if (sessionData.currentDialog === Dialogs.RepeatQuestion) {
        if (!command.some(word => ['да', 'нет', 'давай'].includes(word))) {
            return { speech: speech('Сейчас я ожидаю ответ "Да" или "Нет".'), endSession: false };
        }

        if (command.includes('нет')) {
            return {
                speech: speech('Вот и сказке конец, А кто слушал — молодец.'),
                endSession: true
            };
        }

        sessionData.chars.length = 0;
        sessionData.currentDialog = Dialogs.Story;
    }

    return { speech: await storyDialog(command.join(' '), sessionData, deps), endSession: false };
}

export async function storyDialog(
    command: string,
    sessionData: SessionData,
    { stemmer, random100 }: DialogDependencies
): Promise<Speech> {
    const { chars } = sessionData;
    const lexemes = await stemmer(command);
    const nextChar = extractCharacter(lexemes);

    if (!nextChar && intents.hasMultipleChars(lexemes)) {
        return answers.onlyOneCharMayCome(sessionData);
    }

    if (!nextChar && intents.repka(lexemes)) {
        return answers.repka(sessionData);
    }

    const currentChar = _.last(chars);

    if (!currentChar) {
        chars.push(createDedka());
    }

    if (sessionData.isNewSession) {
        return speech(`${answers.intro(random100)} ${answers.storyBegin(random100)}`);
    }

    if (!currentChar) {
        return speech(answers.storyBegin(random100));
    }

    if (!nextChar) {
        return concatSpeech(`Это не похоже на персонажа.`, answers.help(sessionData));
    }

    chars.push(nextChar);

    const story: Speech[] = [];

    if (intents.babka(nextChar)) {
        story.push(answers.babkaCome());
    }

    story.push(formatStory(chars));

    if (isStoryOver(nextChar, chars)) {
        story.push(speech('— вытянули репку! Какая интересная сказка. Хочешь послушать снова?'));
        sessionData.currentDialog = Dialogs.RepeatQuestion;
    } else {
        story.push(concatSpeech(`вытянуть не могут.`, formatCall(nextChar)));
    }

    return joinSpeech(story);
}

function formatStory(characters: Character[]): Speech {
    const story = _.reverse(toPairs(characters))
        .map(pair => `${formatCharNominative(pair[1])} за ${formatCharAccusative(pair[0])}`)
        .join(', ');

    return speech(`${_.capitalize(story)}, дедка за репку — тянут-потянут,`);
}

function toPairs(characters: Character[]): [Character, Character][] {
    const [first, ...rest] = characters;

    if (!rest.length) {
        return [];
    }

    return [[first, rest[0]], ...toPairs(rest)];
}

function formatCall(char: Character) {
    return _.capitalize(`${formatCallWord(char)} ${formatCharNominative(char)}...`);
}

function isStoryOver(char: Character, characters: Character[]) {
    const isLastMouse = char.subject.nominative === 'мышка';
    const tooManyCharacters = characters.length >= 6;
    return isLastMouse || tooManyCharacters;
}

function formatCallWord(char: Character) {
    return isCharMale(char) ? 'позвал' : isCharFamela(char) ? 'позвала' : 'позвало';
}
