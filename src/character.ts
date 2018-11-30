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
    gender: Gender;
};

export function isCharMale(char: Character) {
    return char.gender === Gender.Male;
}

export function isCharFamela(char: Character) {
    return char.gender === Gender.Famela;
}

export function formatCharNominative(char: Character) {
    return char.subject.nominative;
}

export function formatCharAccusative(char: Character) {
    return char.subject.accusative;
}
