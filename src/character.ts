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
    subject: Word;
    attributes: Word[];
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
    const adj = char.attributes.map(a => a.nominative).join(' ');
    return adj ? `${adj} ${char.subject.nominative}` : char.subject.nominative;
}

export function formatCharAccusative(char: Character) {
    const adj = char.attributes.map(a => a.accusative).join(' ');
    return adj ? `${adj} ${char.subject.accusative}` : char.subject.accusative;
}
