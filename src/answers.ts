import { Character, isCharMale, isCharFamela, isCharUnisex } from './character';
import { Session } from './Session';
import { sample, upperFirst } from './utils';
import { createSpeech, Speech, speak, tts } from './speech';
import { emoji } from './emoji';

export type AnswerBuilder = (char: Character, previousChar: Character, random100: number) => Speech;

export function storyBegin(): Speech {
    return speak(
        'Посадил дед репку.',
        'Выросла репка большая-пребольшая. Стал дед репку из земли тянуть. Тянет-потянет, вытянуть не может. Кого позвал дедка?',
    );
}

export function intro(): Speech {
    return speak(
        ['Привет, ребята!', 'Привет - ребята! - '],
        tts`Хотите ${'- -'} вместе ${'-'} сочинить сказку?${' - - '}`,
        tts`Вы слышали ${'-'} как посадил дед репку?${' - - '}`,
        tts`А кто помогал её тянуть? ${'- -'} Давайте придумаем вместе.${' - - - '}`,
        storyBegin(),
    );
}

export function whoCalled(session: Session) {
    const char = session.findLastCharacter();

    if (char) {
        return `Кого ${called(char)} ${nom(char)}?`;
    }

    return '';
}

export function whoCalled2(char: Character) {
    return `Кого ${called(char)} ${nom(char)}?`;
}

export function yesOrNoExpected(): Speech {
    return speak(
        ['Сейчас я ожидаю в ответ "Да" или "Нет".', 'сейчас я ожидаю в ответ - - да - - или  нет.'],
        'Хотите продолжить игру?',
    );
}

export function endOfStory() {
    return speak('Вот и сказке конец, а кто слушал — молодец.');
}

export function wrongCommand(char: Character) {
    return speak(
        `Это не похоже на персонажа.`,
        tts`Для подсказки скажите ${'-'} "Помощь".`,
        whoCalled2(char),
    );
}

export function inanimateCalled(inanimate: Character, previousChar: Character) {
    const zval = byGender(previousChar, 'звал', 'звала', 'звало');

    return speak(
        `Долго ${zval} ${nom(previousChar)} ${acc(inanimate)} —`,
        speak([
            byGender(previousChar, 'не дозвался.', 'не дозвалась.', 'не дозвалось.'),
            byGender(previousChar, ' - не дозв+ался.', ' - не дозвал+ась.', ' - не дозвал+ось.'),
        ]),
        'Давайте позовем другого персонажа.',
        whoCalled2(previousChar),
    );
}

export function formatStory(chars: readonly Character[]): Speech {
    const text: string[] = [];
    const tts: string[] = [];

    for (let i = 0; i < chars.length - 1; i++) {
        const sub = chars[i + 1];
        const obj = chars[i];
        const em = emoji[nom(sub)] || emoji[norm(sub)];
        const emojiPart = em ? ` ${em} ` : ' ';

        text.push(`${nom(sub)}${emojiPart} за ${acc(obj)}`);
        tts.push(`${nomTts(sub)} за ${accTts(obj)}`);
    }

    text.reverse();
    tts.reverse();

    return speak(
        [upperFirst(text.join(', ')), tts.join(' - ')],
        [`, дедка 👴 за репку.`, ' - дедка за репку.'],
    );
}

export function success() {
    return speak(
        [
            'Тянут-потянут 🎉 вытянули репку!',
            'Тянут-потянут <speaker audio="alice-sounds-human-kids-1.opus"> - вытянули репку!',
        ],
        'Какая интересная сказка! Хотите продолжить игру?',
    );
}

export function failure(char: Character) {
    return speak(`Тянут-потянут — вытянуть не могут.`, whoCalled2(char));
}

export const chars = {
    granny(char: Character) {
        const come = comeCapitalized(char);
        return speak(`${come} ${nom(char)}.`);
    },
    grandfather(char: Character, previousChar: Character, random100: number) {
        const come = comeCapitalized(char);
        const soundNumber = sample([1, 2], random100);

        return speak([
            `${come} ${nom(char)}.`,
            `${come} ${nom(
                char,
            )} - <speaker audio="alice-sounds-human-sneeze-${soundNumber}.opus">.`,
        ]);
    },
    alice() {
        return speak([
            `Запустилась Алиса.`,
            `Запустилась Алиса - <speaker audio="dialogs-upload/d72eedce-c6f5-412b-8ed7-93cdccd9b716/8331f8db-0b01-4fcc-8530-ba8c1c676643.opus">.`,
        ]);
    },
    mouse(mouse: Character) {
        const come = comeRunningCapitalized(mouse);

        return speak([
            `${come} ${nom(mouse)}.`,
            `${come} ${nom(mouse)} - <speaker audio="alice-music-violin-b-1.opus">.`,
        ]);
    },
    cat(char: Character, previousChar: Character, random100: number) {
        const useSOftMeow = isCharFamela(char) || nom(char).includes('котен');
        const soundNumber = sample(useSOftMeow ? [3, 4] : [1, 2], random100);
        const meow = speak([
            '- мяу -',
            `<speaker audio="alice-sounds-animals-cat-${soundNumber}.opus">`,
        ]);

        const clung = byGender(char, 'вцепился', 'вцепилась', 'вцепилось');
        const name = nom(char);
        const description = name === 'мурка' ? 'кошка ' : '';

        return speak(
            byGender(char, 'Прибежал', 'Прибежала', 'Прибежало'),
            `${description}${name}`,
            meow,
            `и ${clung} в ${acc(previousChar)}.`,
        );
    },
    dog(dog: Character, _prev: Character, random100: number) {
        const come = comeRunningCapitalized(dog);
        const soundNumber = sample([3, 5], random100);

        return speak([
            `${come} ${nom(dog)}.`,
            `${come} ${nomTts(
                dog,
            )} - <speaker audio="alice-sounds-animals-dog-${soundNumber}.opus">.`,
        ]);
    },
    owl(owl: Character, _prev: Character, random100: number) {
        const come = flownCapitalized(owl);
        const soundNumber = sample([1, 2], random100);

        return createSpeech(
            `${come} ${nom(owl)}.`,
            `${come} ${nom(owl)} - <speaker audio="alice-sounds-animals-owl-${soundNumber}.opus">.`,
        );
    },
    rooster(rooster: Character) {
        const come = flownCapitalized(rooster);

        return createSpeech(
            `${come} ${nom(rooster)}.`,
            `${come} ${nom(rooster)} - <speaker audio="alice-sounds-animals-rooster-1.opus">.`,
        );
    },
    wolf(wolf: Character) {
        const come = comeRunningCapitalized(wolf);

        return createSpeech(
            `${come} ${nom(wolf)}.`,
            `${come} ${nom(wolf)} - <speaker audio="alice-sounds-animals-wolf-1.opus">.`,
        );
    },
    fox(char: Character) {
        const come = comeRunningCapitalized(char);

        return createSpeech(
            `${come} ${nom(char)}.`,
            `${come} ${nom(char)} - <speaker audio="alice-music-violin-c-1.opus">.`,
        );
    },
    bear(char: Character, prev: Character, random100: number) {
        const come = comeCapitalized(char);

        const sound = sample(
            [
                '<speaker audio="dialogs-upload/d72eedce-c6f5-412b-8ed7-93cdccd9b716/e29520bc-c2e2-40e5-9b7a-bc805fe89b1e.opus">',
                '<speaker audio="dialogs-upload/d72eedce-c6f5-412b-8ed7-93cdccd9b716/baef2695-35fd-471b-b40f-7c34f7eeec31.opus">',
            ],
            random100,
        );

        return speak([`${come} ${nom(char)}.`, `${come} ${nom(char)} - ${sound}.`]);
    },
    crow(crow: Character) {
        const come = flownCapitalized(crow);

        return createSpeech(
            `${come} ${nom(crow)}.`,
            `${come} ${nom(crow)} - <speaker audio="alice-sounds-animals-crow-1.opus">.`,
        );
    },
    lion(lion: Character) {
        const come = comeCapitalized(lion);

        return createSpeech(
            `${come} ${nom(lion)}.`,
            `${come} ${nom(lion)} - <speaker audio="alice-sounds-animals-lion-1.opus">.`,
        );
    },
    cow(cow: Character) {
        const come = comeCapitalized(cow);

        return createSpeech(
            `${come} ${nom(cow)}.`,
            `${come} ${nom(cow)} - <speaker audio="alice-sounds-animals-cow-2.opus">.`,
        );
    },
    horse(horse: Character, _prev: Character, random100: number) {
        const come = riddenCapitalized(horse);
        const soundNumber = (random100 % 2) + 1;

        return createSpeech(
            `${come} ${nom(horse)}.`,
            `${come} ${nom(
                horse,
            )} - <speaker audio="alice-sounds-animals-horse-${soundNumber}.opus">.`,
        );
    },
    chicken(chicken: Character) {
        const come = comeRunningCapitalized(chicken);

        return createSpeech(
            `${come} ${nom(chicken)}.`,
            `${come} ${nom(chicken)} - <speaker audio="alice-sounds-animals-chicken-1.opus">.`,
        );
    },
    frog(frog: Character) {
        const come = riddenCapitalized(frog);

        return createSpeech(
            `${come} ${nom(frog)}.`,
            `${come} ${nom(frog)} - <speaker audio="alice-sounds-animals-frog-1.opus">.`,
        );
    },
    elephant(char: Character, _previousChar: Character, random100: number): Speech {
        const come = comeCapitalized(char);
        const n = sample([1, 2], random100);

        return createSpeech(
            `${come} ${nom(char)}.`,
            `${come} ${nom(char)} - <speaker audio="alice-sounds-animals-elephant-${n}.opus">.`,
        );
    },
    fish(char: Character, previousChar: Character) {
        const nemu = byGender(previousChar, 'нему', 'ней', 'нему');
        const poshel = byGender(previousChar, 'Пошёл', 'Пошла', 'Пошло');
        const stalOn = byGender(previousChar, 'стал он', 'стала она', 'стало оно');

        return speak(
            `${poshel} ${nom(previousChar)} к синему морю;`,
            createSpeech('', '<speaker audio="alice-sounds-nature-sea-1.opus"> - - '),
            `${stalOn} кликать ${acc(char)}, приплыла к ${nemu} рыбка, спросила:`,
            `«Чего тебе надобно ${nom(previousChar)}?»`,
            `Ей с поклоном ${nom(previousChar)} отвечает:`,
            `«Смилуйся, государыня рыбка, помоги вытянуть репку.»`,
        );
    },
    girl(char: Character) {
        const come = comeRunningCapitalized(char);

        return createSpeech(
            `${come} ${nom(char)}.`,
            `${come} ${nom(char)} - <speaker audio="alice-sounds-human-laugh-5.opus">.`,
        );
    },

    zombie(char: Character, previousChar: Character) {
        const come = comeRunningCapitalized(char);

        return createSpeech(
            `Пришло страшное ${nom(char)} и схватило ${acc(previousChar)}.`,
            `Пришло страшное ${nom(
                char,
            )} - <speaker audio="alice-sounds-human-walking-dead-2.opus"> - и схватило ${acc(
                previousChar,
            )}.`,
        );
    },
};

function called(char: Character) {
    return byGender(char, 'позвал', 'позвала', 'позвало');
}

function byGender<T>(char: Character, male: T, famela: T, other: T) {
    if (isCharMale(char) || isCharUnisex(char)) {
        return male;
    }

    return isCharFamela(char) ? famela : other;
}

export function nom(char: Character) {
    return char.subject.nominative;
}

export function nomTts(char: Character) {
    return char.tts ? char.tts.nominative : char.subject.nominative;
}

export function acc(char: Character) {
    return char.subject.accusative;
}

export function accTts(char: Character) {
    return char.tts ? char.tts.accusative : char.subject.accusative;
}

export function norm(char: Character) {
    return char.normal;
}

function comeRunningCapitalized(char: Character) {
    return byGender(char, 'Прибежал', 'Прибежала', 'Прибежало');
}

function comeCapitalized(char: Character) {
    return byGender(char, 'Пришёл', 'Пришла', 'Пришло');
}

function riddenCapitalized(char: Character) {
    return byGender(char, 'Прискакал', 'Прискакала', 'Прискакало');
}

function flownCapitalized(char: Character) {
    return byGender(char, 'Прилетел', 'Прилетела', 'Прилетело');
}
