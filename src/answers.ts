import * as _ from 'lodash';
import { Character, isCharMale, isCharFamela, isCharUnisex } from './character';
import { SessionData, Dialogs, GameMode } from './sessionData';
import { sample } from './utils';
import { createSpeech, Speech, speak, tts } from './speech';
import { alphabetFirstLetter } from './alphabet';

export type AnswerBuilder = (char: Character, previousChar: Character, random100: number) => Speech;

function aboutSkill(): Speech {
    return speak(
        'Давайте вместе сочиним сказку.',
        tts`Вы слышали ${'-'} как посадил дед`,
        ['👴', ''],
        'репку? А кто помогал её тянуть? Давайте придумаем вместе.',
    );
}

export function storyBegin(mode: GameMode): Speech {
    return speak(
        mode === GameMode.BlackCity
            ? tts`Хорошо! В одном чёрном-чёрном городе ${'- -'} посадил дед репку.`
            : 'Посадил дед репку.',
        'Выросла репка большая-пребольшая. Стал дед репку из земли тянуть. Тянет-потянет, вытянуть не может. Кого позвал дедка?',
        mode === GameMode.BlackCity ? blackCityManual() : '',
    );
}

export function blackCityManual() {
    return speak('В чёрном городе все персонажи начинаются на букву', speak(['"Ч".', ' - Чэ.']));
}

export function blackCityError(char: Character) {
    return speak(
        `${_.upperFirst(norm(char))} начинается на букву`,
        alphabetFirstLetter(char),
        '.',
        blackCityManual(),
    );
}

export function intro(random100: number): Speech {
    return speak(
        sample(['Хорошо.', 'С удовольствием!'], random100),
        aboutSkill(),
        storyBegin(GameMode.Classic),
    );
}

export function help(sessionData: SessionData) {
    const char = _.last(sessionData.chars);

    if (char) {
        return speak(aboutSkill(), whoCalled2(char));
    }

    return aboutSkill();
}

export function whoCalled(sessionData: SessionData) {
    const char = _.last(sessionData.chars);

    if (char) {
        return `Кого ${called(char)} ${nom(char)}?`;
    }

    return '';
}

export function whoCalled2(char: Character) {
    return `Кого ${called(char)} ${nom(char)}?`;
}

export function yesOrNoExpected(): Speech {
    return speak([
        'Сейчас я ожидаю в ответ "Да" или "Нет".',
        'сейчас я ожидаю в ответ - - да - - или  нет.',
    ]);
}

export function endOfStory() {
    return speak('Вот и сказке конец, а кто слушал — молодец.');
}

export function wrongCommand(sessionData: SessionData) {
    return speak(`Это не похоже на персонажа.`, help(sessionData));
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

export function formatStory(chars: Character[]): Speech {
    const chain: string[] = [];

    for (let i = 0; i < chars.length - 1; i++) {
        chain.push(`${nom(chars[i + 1])} за ${acc(chars[i])}`);
    }

    chain.reverse();
    return speak(
        [_.upperFirst(chain.join(', ')), chain.join(' - ')],
        [`, дедка за репку.`, ' - дедка за репку.'],
    );
}

export function success() {
    return speak(
        [
            'Тянут-потянут — вытянули репку!',
            'Тянут-потянут - <speaker audio="alice-sounds-human-kids-1.opus"> - вытянули репку!',
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
    dog(dog: Character, _prev, random100: number) {
        const come = comeRunningCapitalized(dog);
        const soundNumber = sample([3, 5], random100);

        return createSpeech(
            `${come} ${nom(dog)}.`,
            `${come} ${nom(dog)} - <speaker audio="alice-sounds-animals-dog-${soundNumber}.opus">.`,
        );
    },
    owl(owl: Character, _prev, random100: number) {
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
    bear(char: Character) {
        const come = comeCapitalized(char);
        return createSpeech(`${come} ${nom(char)}.`);
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
    horse(horse: Character, _prev, random100: number) {
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

export function acc(char: Character) {
    return char.subject.accusative;
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
