export type Word = {
    nominative: string;
    accusative: string;
};

export enum Gender {
    Male,
    Famela,
    Neuter
}

export type Character = {
    noun: Word;
    adjectives: Word[];
    gender: Gender;
};

export type MultipleCharacters = {
    nominativeSingle: string;
    accusativeMutliple: string;
};

export function isCharMale(char: Character) {
    return char.gender === Gender.Male;
}

export function isCharFamela(char: Character) {
    return char.gender === Gender.Famela;
}

export function formatCharNominative(char: Character) {
    const adj = char.adjectives.map(a => a.nominative).join(' ');
    return adj ? `${adj} ${char.noun.nominative}` : char.noun.nominative;
}

export function formatCharAccusative(char: Character) {
    const adj = char.adjectives.map(a => a.accusative).join(' ');
    return adj ? `${adj} ${char.noun.accusative}` : char.noun.accusative;
}
