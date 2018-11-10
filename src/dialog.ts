import * as _ from 'lodash';
import { Stemmer } from './stemmer';
import { Character, isCharMale, isCharFamela } from './character';
import { extractCharacter, createDedka } from './extractCharacter';

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
        return `Позвал ${currentChar.noun.nominative}... Кого?`;
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
        .map(pair => `${pair[1].noun.nominative} за ${pair[0].noun.accusative}`)
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
    const callWord = isCharMale(char) ? 'Позвал' : isCharFamela(char) ? 'Позвала' : 'Позвало';
    return `${callWord} ${char.noun.nominative}...`;
}

function isStoryOver(char: Character, characters: Character[]) {
    const isLastMouse = char.noun.nominative === 'мышка';
    const tooManyCharacters = characters.length >= 10;
    return isLastMouse || tooManyCharacters;
}
