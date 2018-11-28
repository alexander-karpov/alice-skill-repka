import * as _ from 'lodash';
import { Stemmer } from './stemmer';
import { extractCharacter, createDedka } from './extractCharacter';
import { SessionData, Dialogs } from './sessionData';
import * as answers from './answers';
import { hasMultipleChars } from './intents';

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
    text: string;
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
        return { text: answers.help(sessionData), endSession: false };
    }

    if (sessionData.currentDialog === Dialogs.RepeatQuestion) {
        const [firstToken, secondToken] = command;

        if (secondToken || !['да', 'нет'].includes(firstToken)) {
            return { text: 'Сейчас я ожидаю слово "Да" или "Нет".', endSession: false };
        }

        if (firstToken === 'нет') {
            return { text: 'Вот и сказке конец, А кто слушал — молодец.', endSession: true };
        }

        sessionData.chars.length = 0;
        sessionData.currentDialog = Dialogs.Story;
    }

    return { text: await storyDialog(command.join(' '), sessionData, deps), endSession: false };
}

export async function storyDialog(
    command: string,
    sessionData: SessionData,
    { stemmer, random100 }: DialogDependencies
) {
    const { chars } = sessionData;
    const lexemes = await stemmer(command);

    if (hasMultipleChars(lexemes)) {
        return answers.onlyOneCharMayCome(sessionData);
    }

    const nextChar = extractCharacter(lexemes);
    const currentChar = _.last(chars);

    if (!currentChar) {
        chars.push(createDedka());
    }

    if (sessionData.isNewSession) {
        return `${answers.intro(random100)} ${answers.storyBegin(random100)}`;
    }

    if (!currentChar) {
        return answers.storyBegin(random100);
    }

    if (!nextChar) {
        return `Это не похоже на персонажа. ${answers.help(sessionData)}`;
    }

    chars.push(nextChar);

    const story = [formatStory(chars)];

    if (isStoryOver(nextChar, chars)) {
        story.push('— вытянули репку! Какая интересная сказка. Хочешь послушать снова?');
        sessionData.currentDialog = Dialogs.RepeatQuestion;
    } else {
        story.push(`вытянуть не могут. ${formatCall(nextChar)}`);
    }

    return story.join(' ');
}

function formatStory(characters: Character[]): string {
    const story = _.reverse(toPairs(characters))
        .map(pair => `${formatCharNominative(pair[1])} за ${formatCharAccusative(pair[0])}`)
        .join(', ');

    return `${_.capitalize(story)}, дедка за репку — тянут-потянут,`;
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
    const tooManyCharacters = characters.length >= 10;
    return isLastMouse || tooManyCharacters;
}

function formatCallWord(char: Character) {
    return isCharMale(char) ? 'позвал' : isCharFamela(char) ? 'позвала' : 'позвало';
}
