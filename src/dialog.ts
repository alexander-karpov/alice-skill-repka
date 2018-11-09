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
    const newCharacter = extractCharacter(tokens);
    const lastCharacter = _.last(characters);

    if (!lastCharacter) {
        characters.push(createDedka());
        return 'Посадил дед репку. Выросла репка большая-пребольшая. Стал дед репку из земли тянуть. Тянет-потянет, вытянуть не может. Позвал дед... Кого?';
    }

    if (!newCharacter) {
        return `Позвал ${lastCharacter.noun.nominative}... Кого?`;
    }

    characters.push(newCharacter);
    return `${makeStory(characters)} ${makeStoryEnd(newCharacter, characters)}`;
}

function makeStory(characters: Character[]): string {
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

function makeStoryEnd(last: Character, characters: Character[]) {
    const isLastMouse = last.noun.nominative === 'мышка';
    const tooManyCharacters = characters.length === 10;

    if (isLastMouse || tooManyCharacters) {
        return '— вытянули репку!';
    }

    return `вытянуть не могут. ${makeCall(last)}`;
}

function makeCall(char: Character) {
    const callWord = isCharMale(char) ? 'Позвал' : isCharFamela(char) ? 'Позвала' : 'Позвало';
    return `${callWord} ${char.noun.nominative}...`;
}
