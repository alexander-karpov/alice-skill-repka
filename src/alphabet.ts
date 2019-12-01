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

export function alphabetLetter(letter: string): Speech {
    const alphabetLetter = alphabet[letter] || letter;

    return speak([`«${letter.toUpperCase()}»`, alphabetLetter]);
}
