import * as _ from 'lodash';
import { Character, isCharMale, isCharFamela, isCharUnisex } from './character';
import { SessionData } from './sessionData';
import { sample, lazySample } from './utils';
import { createSpeech, Speech, concatSpeech } from './speech';

export type AnswerBuilder = (char: Character, previousChar: Character, random100: number) => Speech;

function aboutSkill(): Speech {
    return concatSpeech(
        'Давайте вместе сочиним сказку.',
        createSpeech('Вы слышали, как посадил дед репку?', 'Вы слышали - как посадил дед репку?'),
        ' А кто помогал её тянуть? Давайте придумаем вместе.',
    );
}

export function storyBegin(): Speech {
    return concatSpeech(
        'Посадил дед репку. Выросла репка большая-пребольшая. Стал дед репку из земли тянуть. Тянет-потянет, вытянуть не может. Кого позвал дедка?',
    );
}

export function intro(random100: number): Speech {
    return concatSpeech(
        sample(['Хорошо.', 'С удовольствием!'], random100),
        aboutSkill(),
        storyBegin(),
    );
}

export function help(sessionData: SessionData) {
    const char = _.last(sessionData.chars);

    if (char) {
        return concatSpeech(aboutSkill(), whoCalled2(char));
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
    return createSpeech(
        'Сейчас я ожидаю в ответ "Да" или "Нет".',
        'сейчас я ожидаю в ответ - - да - - или  нет.',
    );
}

export function endOfStory() {
    return createSpeech('Вот и сказке конец, А кто слушал — молодец.');
}

export function wrongCommand(sessionData: SessionData) {
    return concatSpeech(`Это не похоже на персонажа.`, help(sessionData));
}

export function inanimateCalled(inanimate: Character, sessionData: SessionData, random100: number) {
    const lastChar = _.last(sessionData.chars) as Character;
    const zval = byGender(lastChar, 'звал', 'звала', 'звало');
    const jdal = byGender(lastChar, 'ждал', 'ждала', 'ждало');

    return lazySample(
        [
            () =>
                concatSpeech(
                    `Долго ${zval} ${nom(lastChar)} ${acc(inanimate)} —`,
                    createSpeech(
                        byGender(lastChar, 'не дозвался.', 'не дозвалась.', 'не дозвалось.'),
                        byGender(lastChar, 'не дозв+ался.', 'не дозвал+ась.', 'не дозвал+ось.'),
                    ),
                    'Давайте позовем другого персонажа.',
                    whoCalled(sessionData),
                ),
            () =>
                concatSpeech(
                    `Долго ${jdal} ${nom(lastChar)} ответа,`,
                    createSpeech(
                        byGender(lastChar, 'не дождался', 'не дождалась', 'не дождалось'),
                        byGender(
                            lastChar,
                            '- - не дожд+ался - -',
                            '- - не дождал+ась',
                            '- - не дождал+ось - -',
                        ),
                    ),
                    `, к репке`,
                    createSpeech(
                        byGender(lastChar, 'воротился', 'воротилась', 'воротилось'),
                        byGender(lastChar, 'ворот+ился', 'ворот+илась', 'ворот+илось'),
                    ),
                    `. И ${called(lastChar)} другого персонажа.`,
                    whoCalled(sessionData),
                ),
            () =>
                concatSpeech(
                    `Свойство ${nom(inanimate)} ${byGender(
                        inanimate,
                        'имел',
                        'имела',
                        'имело',
                    )}: говорить ${byGender(inanimate, 'он умел', 'она умела', 'оно умело')}.`,
                    byGender(inanimate, 'Попросил', 'Попросила', 'Попросило'),
                    'позвать другого персонажа.',
                    whoCalled(sessionData),
                ),
        ],
        random100,
    );
}

export function formatStory(chars: Character[]): Speech {
    const chain: string[] = [];

    for (let i = 0; i < chars.length - 1; i++) {
        chain.push(`${nom(chars[i + 1])} за ${acc(chars[i])}`);
    }

    chain.reverse();
    const story = createSpeech(_.upperFirst(chain.join(', ')), chain.join(' - '));
    return concatSpeech(story, createSpeech(`, дедка за репку.`, ' - дедка за репку.'));
}

export function success() {
    return concatSpeech(
        createSpeech(
            'Тянут-потянут — вытянули репку!',
            'Тянут-потянут - <speaker audio="alice-sounds-human-kids-1.opus"> - вытянули репку!',
        ),
        'Какая интересная сказка! Хотите послушать снова?',
    );
}

export function failure(char: Character) {
    return concatSpeech(`Тянут-потянут — вытянуть не могут.`, whoCalled2(char));
}

export const chars = {
    granny(char: Character) {
        const come = comeCapitalized(char);
        return createSpeech(`${come} ${nom(char)}.`);
    },
    mouse(mouse: Character) {
        const come = comeRunningCapitalized(mouse);

        return createSpeech(
            `${come} ${nom(mouse)}.`,
            `${come} ${nom(mouse)} - <speaker audio="alice-music-violin-b-1.opus">.`,
        );
    },
    cat(char: Character, previousChar: Character, random100: number) {
        const useSOftMeow = isCharFamela(char) || nom(char).includes('котен');
        const soundNumber = sample(useSOftMeow ? [3, 4] : [1, 2], random100);
        const meow = createSpeech(
            '- мяу -',
            `<speaker audio="alice-sounds-animals-cat-${soundNumber}.opus">`,
        );

        const clung = byGender(char, 'вцепился', 'вцепилась', 'вцепилось');
        const name = nom(char);
        const description = name === 'мурка' ? 'кошка ' : '';

        return concatSpeech(
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

        return concatSpeech(
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
