import { Character } from './Character';
import { sample, upperFirst } from './utils';
import { createSpeech, Speech, speak, tts } from './speech';
import { emoji } from './emoji';

export type AnswerBuilder = (char: Character, previousChar: Character, random100: number) => Speech;

export function storyBegin(): Speech {
    return speak(
        'Посадил дед репку.',
        'Выросла репка большая-пребольшая. Стал дед репку из земли тянуть. Тянет-потянет, вытянуть не может. Кого позвал дедка?'
    );
}

export function intro(): Speech {
    return speak(
        ['Привет, ребята!', 'Привет - ребята! - '],
        tts`Хотите ${'- -'} вместе ${'-'} сочинить сказку?${' - - '}`,
        tts`Вы слышали ${'-'} как посадил дед репку?${' - - '}`,
        tts`А кто помогал её тянуть? ${'- -'} Давайте придумаем вместе.${' - - - '}`,
        storyBegin()
    );
}

export function whoCalled2(char: Character) {
    return `Кого ${called(char)} ${char.nominative}?`;
}

export function yesOrNoExpected(): Speech {
    return speak(
        ['Сейчас я ожидаю в ответ "Да" или "Нет".', 'сейчас я ожидаю в ответ - - да - - или  нет.'],
        'Хотите продолжить игру?'
    );
}

export function endOfStory() {
    return speak('Вот и сказке конец, а кто слушал — молодец.');
}

export function wrongCommand(char: Character) {
    return speak(
        `Это не похоже на персонажа.`,
        tts`Для подсказки скажите ${'-'} "Помощь".`,
        whoCalled2(char)
    );
}

export function inanimateCalled(inanimate: Character, previousChar: Character) {
    const zval = previousChar.byGender('звал', 'звала', 'звало');

    return speak(
        `Долго ${zval} ${previousChar.nominative} ${inanimate.accusative} —`,
        speak([
            previousChar.byGender('не дозвался.', 'не дозвалась.', 'не дозвалось.'),
            previousChar.byGender(' - не дозв+ался.', ' - не дозвал+ась.', ' - не дозвал+ось.'),
        ]),
        'Давайте позовем другого персонажа.',
        whoCalled2(previousChar)
    );
}

export function formatStory(chars: readonly Character[]): Speech {
    const text: string[] = [];
    const tts: string[] = [];

    for (let i = 0; i < chars.length - 1; i++) {
        const sub = chars[i + 1];
        const obj = chars[i];
        const em = emoji[sub.nominative] || emoji[sub.normal];
        const emojiPart = em ? ` ${em} ` : ' ';

        text.push(`${sub.nominative}${emojiPart} за ${obj.accusative}`);
        tts.push(`${sub.nominativeTts} за ${obj.accusativeTts}`);
    }

    text.reverse();
    tts.reverse();

    return speak(
        [upperFirst(text.join(', ')), tts.join(' - ')],
        [`, дедка 👴 за репку.`, ' - дедка за репку.']
    );
}

export function success() {
    return speak(
        [
            'Тянут-потянут 🎉 вытянули репку!',
            'Тянут-потянут <speaker audio="alice-sounds-human-kids-1.opus"> - вытянули репку!',
        ],
        'Какая интересная сказка! Хотите продолжить игру?'
    );
}

export function cantPull(char: Character) {
    return speak(`Тянут-потянут — вытянуть не могут.`, whoCalled2(char));
}

export const chars = {
    granny(char: Character) {
        const come = comeCapitalized(char);
        return speak(`${come} ${char.nominative}.`);
    },
    grandfather(char: Character, previousChar: Character, random100: number) {
        const come = comeCapitalized(char);
        const soundNumber = sample([1, 2], random100);

        return speak([
            `${come} ${char.nominative}.`,
            `${come} ${char.nominative} - <speaker audio="alice-sounds-human-sneeze-${soundNumber}.opus">.`,
        ]);
    },
    alice() {
        return speak([`Запустилась Алиса.`, `Запустилась Алиса.`]);
    },

    harryPotter() {
        return speak([`Акцио, репка!`, `+Акцо, репка!  - - - `]);
    },
    mouse(char: Character) {
        const come = comeRunningCapitalized(char);

        return speak([
            `${come} ${char.nominative}.`,
            `${come} ${char.nominative} - <speaker audio="alice-music-violin-b-1.opus">.`,
        ]);
    },
    rat(char: Character, previousChar: Character, random100: number) {
        const come = comeRunningCapitalized(char);

        const sound = sample(
            [
                '<speaker audio="dialogs-upload/d72eedce-c6f5-412b-8ed7-93cdccd9b716/01ae230e-69f3-4f76-93e8-8da388f7cf65.opus">',
                '<speaker audio="dialogs-upload/d72eedce-c6f5-412b-8ed7-93cdccd9b716/7f7c2a7d-b8bc-4a13-ad74-c1d0bf5f5797.opus">',
            ],
            random100
        );

        return speak([`${come} ${char.nominative}.`, `${come} ${char.nominative} - ${sound}.`]);
    },
    dino(char: Character, previousChar: Character, random100: number) {
        const come = comeCapitalized(char);

        const sound = sample(
            [
                '<speaker audio="dialogs-upload/d72eedce-c6f5-412b-8ed7-93cdccd9b716/69921ea2-cc7c-46fa-9390-ad946e74da05.opus">',
                '<speaker audio="dialogs-upload/d72eedce-c6f5-412b-8ed7-93cdccd9b716/7f5e067f-f1c7-45c8-ac0e-136ed2946e48.opus">',
            ],
            random100
        );

        return speak([`${come} ${char.nominative}.`, `${come} ${char.nominative} - ${sound}.`]);
    },
    cat(char: Character, previousChar: Character, random100: number) {
        const famelaMeow = [3, 4];
        const maleMeow = char.nominative.includes('котен') ? famelaMeow : [1, 2];

        const soundNumber = sample(char.byGender(maleMeow, famelaMeow, maleMeow), random100);
        const meow = speak([
            '- мяу -',
            `<speaker audio="alice-sounds-animals-cat-${soundNumber}.opus">`,
        ]);

        const clung = char.byGender('вцепился', 'вцепилась', 'вцепилось');
        const name = char.nominative;
        const description = name === 'мурка' ? 'кошка ' : '';

        return speak(
            char.byGender('Прибежал', 'Прибежала', 'Прибежало'),
            `${description}${name}`,
            meow,
            `и ${clung} в ${previousChar.accusative}.`
        );
    },
    dog(char: Character, _prev: Character, random100: number) {
        const come = comeRunningCapitalized(char);
        const soundNumber = sample([3, 5], random100);

        return speak([
            `${come} ${char.nominative}.`,
            `${come} ${char.nominativeTts} - <speaker audio="alice-sounds-animals-dog-${soundNumber}.opus">.`,
        ]);
    },
    owl(char: Character, _prev: Character, random100: number) {
        const come = flownCapitalized(char);
        const soundNumber = sample([1, 2], random100);

        return createSpeech(
            `${come} ${char.nominative}.`,
            `${come} ${char.nominative} - <speaker audio="alice-sounds-animals-owl-${soundNumber}.opus">.`
        );
    },
    rooster(char: Character) {
        const come = flownCapitalized(char);

        return createSpeech(
            `${come} ${char.nominative}.`,
            `${come} ${char.nominative} - <speaker audio="alice-sounds-animals-rooster-1.opus">.`
        );
    },
    wolf(char: Character) {
        const come = comeRunningCapitalized(char);

        return createSpeech(
            `${come} ${char.nominative}.`,
            `${come} ${char.nominative} - <speaker audio="alice-sounds-animals-wolf-1.opus">.`
        );
    },
    fox(char: Character) {
        const come = comeRunningCapitalized(char);

        return createSpeech(
            `${come} ${char.nominative}.`,
            `${come} ${char.nominative} - <speaker audio="alice-music-violin-c-1.opus">.`
        );
    },
    bear(char: Character, prev: Character, random100: number) {
        const come = comeCapitalized(char);

        const sound = sample(
            [
                '<speaker audio="dialogs-upload/d72eedce-c6f5-412b-8ed7-93cdccd9b716/e29520bc-c2e2-40e5-9b7a-bc805fe89b1e.opus">',
                '<speaker audio="dialogs-upload/d72eedce-c6f5-412b-8ed7-93cdccd9b716/baef2695-35fd-471b-b40f-7c34f7eeec31.opus">',
            ],
            random100
        );

        return speak([`${come} ${char.nominative}.`, `${come} ${char.nominative} - ${sound}.`]);
    },
    crow(char: Character) {
        const come = flownCapitalized(char);

        return createSpeech(
            `${come} ${char.nominative}.`,
            `${come} ${char.nominative} - <speaker audio="alice-sounds-animals-crow-1.opus">.`
        );
    },
    lion(char: Character) {
        const come = comeCapitalized(char);

        return createSpeech(
            `${come} ${char.nominative}.`,
            `${come} ${char.nominative} - <speaker audio="alice-sounds-animals-lion-1.opus">.`
        );
    },
    cow(char: Character) {
        const come = comeCapitalized(char);

        return createSpeech(
            `${come} ${char.nominative}.`,
            `${come} ${char.nominative} - <speaker audio="alice-sounds-animals-cow-2.opus">.`
        );
    },
    crocodile(char: Character) {
        const come = crawledCapitalized(char);

        return createSpeech(
            `${come} ${char.nominative}.`,
            `${come} ${char.nominative} - <speaker audio="dialogs-upload/d72eedce-c6f5-412b-8ed7-93cdccd9b716/38d9977f-9dd8-421d-866c-14900749f7cd.opus">.`
        );
    },
    tiger(char: Character) {
        const come = comeRunningCapitalized(char);

        return createSpeech(
            `${come} ${char.nominative}.`,
            `${come} ${char.nominative} - <speaker audio="dialogs-upload/d72eedce-c6f5-412b-8ed7-93cdccd9b716/29479c2a-e251-495a-a387-1473c5422aff.opus">.`
        );
    },
    horse(char: Character, _prev: Character, random100: number) {
        const come = riddenCapitalized(char);
        const soundNumber = (random100 % 2) + 1;

        return createSpeech(
            `${come} ${char.nominative}.`,
            `${come} ${char.nominative} - <speaker audio="alice-sounds-animals-horse-${soundNumber}.opus">.`
        );
    },
    chicken(char: Character) {
        const come = comeRunningCapitalized(char);

        return createSpeech(
            `${come} ${char.nominative}.`,
            `${come} ${char.nominative} - <speaker audio="alice-sounds-animals-chicken-1.opus">.`
        );
    },
    frog(char: Character) {
        const come = riddenCapitalized(char);

        return createSpeech(
            `${come} ${char.nominative}.`,
            `${come} ${char.nominative} - <speaker audio="alice-sounds-animals-frog-1.opus">.`
        );
    },
    elephant(char: Character, _previousChar: Character, random100: number): Speech {
        const come = comeCapitalized(char);
        const n = sample([1, 2], random100);

        return createSpeech(
            `${come} ${char.nominative}.`,
            `${come} ${char.nominative} - <speaker audio="alice-sounds-animals-elephant-${n}.opus">.`
        );
    },
    fish(char: Character, previousChar: Character) {
        const nemu = previousChar.byGender('нему', 'ней', 'нему');
        const poshel = previousChar.byGender('Пошёл', 'Пошла', 'Пошло');
        const stalOn = previousChar.byGender('стал он', 'стала она', 'стало оно');

        return speak(
            `${poshel} ${previousChar.nominative} к синему морю;`,
            createSpeech('', '<speaker audio="alice-sounds-nature-sea-1.opus"> - - '),
            `${stalOn} кликать ${char.accusative}, приплыла к ${nemu} рыбка, спросила:`,
            `«Чего тебе надобно ${previousChar.nominative}?»`,
            `Ей с поклоном ${previousChar.nominative} отвечает:`,
            `«Смилуйся, государыня рыбка, помоги вытянуть репку.»`
        );
    },
    girl(char: Character) {
        const come = comeRunningCapitalized(char);

        return createSpeech(
            `${come} ${char.nominative}.`,
            `${come} ${char.nominative} - <speaker audio="alice-sounds-human-laugh-5.opus">.`
        );
    },

    zombie(char: Character, previousChar: Character) {
        const come = comeRunningCapitalized(char);

        return createSpeech(
            `Пришло страшное ${char.nominative} и схватило ${previousChar.accusative}.`,
            `Пришло страшное ${char.nominative} - <speaker audio="alice-sounds-human-walking-dead-2.opus"> - и схватило ${previousChar.accusative}.`
        );
    },
};

function called(char: Character) {
    return char.byGender('позвал', 'позвала', 'позвало');
}

function heSheIt(char: Character) {
    return char.byGender('он', 'она', 'оно');
}

function comeRunningCapitalized(char: Character) {
    return char.byGender('Прибежал', 'Прибежала', 'Прибежало');
}

function comeCapitalized(char: Character) {
    return char.byGender('Пришёл', 'Пришла', 'Пришло');
}

function riddenCapitalized(char: Character) {
    return char.byGender('Прискакал', 'Прискакала', 'Прискакало');
}

function flownCapitalized(char: Character) {
    return char.byGender('Прилетел', 'Прилетела', 'Прилетело');
}

function crawledCapitalized(char: Character) {
    return char.byGender('Приполз', 'Приползла', 'Приползло');
}
