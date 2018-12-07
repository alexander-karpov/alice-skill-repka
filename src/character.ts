import * as _ from 'lodash';

export type Word = {
    nominative: string;
    accusative: string;
};

export enum Gender {
    Male,
    Famela,
    Neuter,
    Unisex
}

export type Character = {
    subject: Word;
    gender: Gender;
};

export function createChar(nom: string, acc: string, gender: Gender): Character {
    return {
        subject: {
            nominative: nom,
            accusative: acc
        },
        gender
    };
}

export function isCharMale(char: Character) {
    return char.gender === Gender.Male;
}

export function isCharFamela(char: Character) {
    return char.gender === Gender.Famela;
}
export function isCharUnisex(char: Character) {
    return char.gender === Gender.Unisex;
}

export function createDedka(): Character {
    return {
        subject: { nominative: 'дедка', accusative: 'дедку' },
        gender: Gender.Male
    };
}
