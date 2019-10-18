export type Word = {
    nominative: string;
    accusative: string;
};

export enum Gender {
    Male,
    Famela,
    Neuter,
    Unisex,
}

export type Character = {
    subject: Word;
    gender: Gender;
    // Нормальная форма главного слова.
    // Помогает при определении, кто это.
    normal: string;
};

export function createChar(nom: string, acc: string, normal: string, gender: Gender): Character {
    return {
        subject: {
            nominative: nom,
            accusative: acc,
        },
        normal,
        gender,
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
        normal: 'дедка',
        gender: Gender.Male,
    };
}
