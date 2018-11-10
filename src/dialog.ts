import * as _ from 'lodash';
import { Stemmer } from './stemmer';
import { extractCharacter, createDedka } from './extractCharacter';
import {
    Character,
    isCharMale,
    isCharFamela,
    formatCharNominative,
    formatCharAccusative
} from './character';

//#region types
export type DialogContext = {
    stemmer: Stemmer;
    characters: Character[];
};
//#endregion

export async function dialog(command: string, { stemmer, characters }: DialogContext) {
    const tokens = await stemmer(command);
    const nextChar = extractCharacter(tokens);
    const currentChar = _.last(characters);

    if (!currentChar) {
        characters.push(createDedka());
        return 'Посадил дед репку. Выросла репка большая-пребольшая. Стал дед репку из земли тянуть. Тянет-потянет, вытянуть не может. Позвал дед... Кого?';
    }

    if (!nextChar) {
        return `Позвал ${formatCharNominative(currentChar)}... Кого?`;
    }

    characters.push(nextChar);

    const story = [formatStory(characters)];

    if (isStoryOver(nextChar, characters)) {
        story.push('— вытянули репку! Какая интересная сказка. Хочешь послушать снова?');
        characters.length = 0;
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
    const isLastMouse = char.noun.nominative === 'мышка';
    const tooManyCharacters = characters.length >= 10;
    return isLastMouse || tooManyCharacters;
}

function formatCallWord(char: Character) {
    return isCharMale(char) ? 'позвал' : isCharFamela(char) ? 'позвала' : 'позвало';
}
