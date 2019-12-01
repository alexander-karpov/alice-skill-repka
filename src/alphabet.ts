import { Character } from './character';
import { Speech, speak } from './speech';

const alphabet: { [l: string]: string | undefined } = {
    а: 'аа',
    б: 'бэ',
    в: 'вэ',
    г: 'гэ',
    д: 'дэ',
    е: 'йэ',
    ж: 'жэ',
    з: 'зэ',
    и: 'Ии',
    к: 'Каа',
    л: 'эллл',
    м: 'эммм',
    н: 'энн',
    о: 'оо',
    п: 'пэ',
    р: 'эрр',
    с: 'эсс',
    т: 'тэ',
    у: 'уу',
    ф: 'фэ',
    х: 'ха',
    ц: 'цэ',
    ч: 'чэ',
    ш: 'шэ',
    щ: 'щще',
    э: 'э',
    ю: 'ю',
    я: 'я',
};

export function alphabeLetter(letter: string): Speech {
    const fixed = letter === 'й' ? 'и' : letter;
    const alphabetLetter = alphabet[fixed] || fixed;

    return speak([`«${fixed.toUpperCase()}»`, alphabetLetter]);
}

export function alphabetFirstLetter(char: Character): Speech {
    return alphabeLetter(char.normal.charAt(0).toLocaleLowerCase());
}

export function alphabetLastLetter(char: Character): Speech {
    return alphabeLetter(char.normal.charAt(char.normal.length - 1).toLocaleLowerCase());
}
