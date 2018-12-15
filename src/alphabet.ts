import { Character } from './character';
import { Speech, createSpeech } from './speech';

const alphabet = {
    а: 'А',
    б: 'Бэ',
    в: 'Вэ',
    г: 'Гэ',
    д: 'Дэ',
    е: 'Е',
    ж: 'Жэ',
    з: 'Зэ',
    и: 'И',
    к: 'Ка',
    л: 'эЛ',
    м: 'эМ',
    н: 'эН',
    о: 'О',
    п: 'Пэ',
    р: 'эР',
    с: 'эС',
    т: 'Тэ',
    у: 'У',
    ф: 'Фэ',
    х: 'Ха',
    ц: 'Цэ',
    ч: 'Че',
    ш: 'Шэ',
    щ: 'Ще',
    э: 'Э',
    ю: 'Ю',
    я: 'Я',
};
export function alphabetFirstLetter(char: Character): Speech {
    const firstLetter = char.subject.nominative.charAt(0).toLocaleLowerCase();
    const alphabetLetter = alphabet[firstLetter];

    if (alphabetLetter) {
        return createSpeech(`"${firstLetter.toUpperCase()}"`, alphabetLetter);
    }

    return createSpeech(`"${firstLetter.toUpperCase()}"`);
}
