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
    adjective: Word[];
    gender: Gender;
};

export function isCharMale(char: Character) {
    return char.gender === Gender.Male;
}

export function isCharFamela(char: Character) {
    return char.gender === Gender.Famela;
}
