import * as _ from 'lodash';
import { Character, isCharMale, isCharFamela, createChar, Gender, isCharUnisex } from './character';
import { SessionData } from './sessionData';
import { sample, lazySample } from './utils';
import { createSpeech, Speech, concatSpeech } from './speech';

const appearanceSpecialPhraseChars = [
    createChar('бабушка', 'бабушку', 'бабушка', Gender.Famela),
    createChar('чёрная кошка', 'чёрную кошку', 'кошка', Gender.Famela),
    createChar('слон', 'слона', 'слон', Gender.Male),
    createChar('золотую рыбка', 'золотую рыбку', 'рыбка', Gender.Famela),
    createChar('серый волк', 'серого волка', 'волк', Gender.Male),
    createChar('ворона', 'ворону', 'ворона', Gender.Famela),
    createChar('коровушка', 'коровушку', 'коровушка', Gender.Famela),
    createChar('страшный лев', 'страшного льва', 'лев', Gender.Male),
    createChar('курочка', 'курочку', 'курочка', Gender.Famela),
    createChar('лошадка', 'лошадку', 'лошадка', Gender.Famela),
    createChar('лягушка', 'лягушку', 'лягушка', Gender.Famela),
    createChar('петушок', 'петушка', 'петушок', Gender.Male),
    createChar('собака', 'собаку', 'собака', Gender.Famela),
    createChar('сова', 'сову', 'сова', Gender.Famela)
];

const REPKA_GROWING =
    'Выросла репка большая-пребольшая. Стал дед репку из земли тянуть. Тянет-потянет, вытянуть не может. Позвал дед...';

const GRANTFATHER_PLANT_LOW = 'посадил дед репку';

function aboutSkill(random100: number): Speech {
    const char = sample(appearanceSpecialPhraseChars, random100);

    return concatSpeech(
        'Я расскажу сказку про репку, если вы мне поможете.',
        'Когда придет время позвать нового героя, дополните рассказ.',
        'Например, я скажу: «Позвал дедка...»,',
        createSpeech(`а вы продолжите: «${acc(char)}».`, `а вы продолжите - ${acc(char)}.`),
        'Вы готовы?'
    );
}

export function storyBegin(random100: number): Speech {
    const cases = [
        `Давным-давно в далёкой деревне ${GRANTFATHER_PLANT_LOW}.`,
        `Жили-были дед да баба. И вот ${GRANTFATHER_PLANT_LOW}.`,
        `В стародавние времена жил на свете дед. И вот отнажды ${GRANTFATHER_PLANT_LOW}.`,
        `На опушке большого леса ${GRANTFATHER_PLANT_LOW}.`,
        `Однажды ${GRANTFATHER_PLANT_LOW}.`,
        `Где-то далеко, в тридесятом царстве ${GRANTFATHER_PLANT_LOW}.`,
        `Жил на опушке дремучего леса дед. ${_.capitalize(GRANTFATHER_PLANT_LOW)}.`,
        `В некотором царстве ${GRANTFATHER_PLANT_LOW}.`,
        `Давно тому назад ${GRANTFATHER_PLANT_LOW}.`,
        `В одной деревне ${GRANTFATHER_PLANT_LOW}.`,
        `Жарким летним днем ${GRANTFATHER_PLANT_LOW}.`,
        `${_.capitalize(GRANTFATHER_PLANT_LOW)}.`
    ];

    return concatSpeech(sample(cases, random100), REPKA_GROWING);
}

export function intro(random100: number): Speech {
    const beforeAbout = ['Хорошо.', 'Давайте.', 'С удовольствием!'];
    return concatSpeech(
        sample(beforeAbout, random100),
        aboutSkill(random100),
        storyBegin(random100)
    );
}

export function help(sessionData: SessionData, random100: number) {
    return concatSpeech(aboutSkill(random100), whoCalled(sessionData));
}

export function onlyOneCharMayCome(sessionData: SessionData) {
    const answer = `Я точно помню, в этой сказке все приходили по одному.`;
    const called = whoCalled(sessionData);

    return createSpeech(`${answer} ${called}`);
}

export function whoCalled(sessionData: SessionData) {
    const char = _.last(sessionData.chars);

    if (char) {
        return `Кого ${called(char)} ${nom(char)}?`;
    }

    return '';
}

export function repka(sessionData: SessionData) {
    return createSpeech(`Репка сама себя не вытянет. ${whoCalled(sessionData)}`);
}

export function babushka() {
    return createSpeech(
        `Бабушка-бабушка, почему у тебя такие большие руки? Чтобы лучше репку тянуть!`
    );
}

export function kot(char: Character, previousChar: Character, random100: number) {
    const useSOftMeow = isCharFamela(char) || nom(char).includes('котен');
    const soundNumber = sample(useSOftMeow ? [3, 4] : [1, 2], random100);
    const meow = createSpeech(
        '- мяу -',
        `<speaker audio="alice-sounds-animals-cat-${soundNumber}.opus">`
    );

    const clung = byGender(char, 'вцепился', 'вцепилась', 'вцепилось');
    const name = nom(char);
    const description = name === 'мурка' ? 'кошка ' : '';

    return concatSpeech(
        byGender(char, 'Прибежал', 'Прибежала', 'Прибежало'),
        `${description}${name}`,
        meow,
        `и ${clung} в ${acc(previousChar)}.`
    );
}

export function slon(random100: number): Speech {
    return concatSpeech(
        `Что делал слон, когда пришёл на поле он?`,
        elephant(random100),
        'Помогал репку тянуть.'
    );
}

export function rybka(char: Character, currentChar: Character) {
    const nemu = byGender(currentChar, 'нему', 'ней', 'нему');
    const poshel = byGender(currentChar, 'Пошёл', 'Пошла', 'Пошло');
    const stalOn = byGender(currentChar, 'стал он', 'стала она', 'стало оно');

    return concatSpeech(
        `${poshel} ${nom(currentChar)} к синему морю;`,
        sea(),
        `${stalOn} кликать ${acc(char)}, приплыла к ${nemu} рыбка, спросила:`,
        `«Чего тебе надобно ${nom(currentChar)}?»`,
        `Ей с поклоном ${nom(currentChar)} отвечает:`,
        `«Смилуйся, государыня рыбка, помоги вытянуть репку.»`
    );
}

export function yesOrNoExpected(): Speech {
    return createSpeech(
        'Сейчас я ожидаю в ответ "Да" или "Нет".',
        'сейчас я ожидаю в ответ - - да - - или  нет.'
    );
}

export function endOfStory() {
    return createSpeech('Вот и сказке конец, А кто слушал — молодец.');
}

export function wrongCommand(sessionData: SessionData, random100: number) {
    return concatSpeech(`Это не похоже на персонажа.`, help(sessionData, random100));
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
                        byGender(lastChar, 'не дозв+ался.', 'не дозвал+ась.', 'не дозвал+ось.')
                    ),
                    'Давайте позовем другого персонажа.',
                    whoCalled(sessionData)
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
                            '- - не дождал+ось - -'
                        )
                    ),
                    `, к репке`,
                    createSpeech(
                        byGender(lastChar, 'воротился', 'воротилась', 'воротилось'),
                        byGender(lastChar, 'ворот+ился', 'ворот+илась', 'ворот+илось')
                    ),
                    `. И ${called(lastChar)} другого персонажа.`,
                    whoCalled(sessionData)
                ),
            () =>
                concatSpeech(
                    `Свойство ${nom(inanimate)} ${byGender(
                        inanimate,
                        'имел',
                        'имела',
                        'имело'
                    )}: говорить ${byGender(inanimate, 'он умел', 'она умела', 'оно умело')}.`,
                    byGender(inanimate, 'Попросил', 'Попросила', 'Попросило'),
                    'позвать другого персонажа.',
                    whoCalled(sessionData)
                )
        ],
        random100
    );
}

export function wolf(wolf: Character) {
    const come = comeRunningCapitalized(wolf);

    return createSpeech(
        `${come} ${nom(wolf)}.`,
        `${come} ${nom(wolf)} - <speaker audio="alice-sounds-animals-wolf-1.opus">.`
    );
}

export function crow(crow: Character) {
    const come = flownCapitalized(crow);

    return createSpeech(
        `${come} ${nom(crow)}.`,
        `${come} ${nom(crow)} - <speaker audio="alice-sounds-animals-crow-1.opus">.`
    );
}
export function lion(lion: Character) {
    const come = comeCapitalized(lion);

    return createSpeech(
        `${come} ${nom(lion)}.`,
        `${come} ${nom(lion)} - <speaker audio="alice-sounds-animals-lion-1.opus">.`
    );
}

export function cow(cow: Character) {
    const come = comeCapitalized(cow);

    return createSpeech(
        `${come} ${nom(cow)}.`,
        `${come} ${nom(cow)} - <speaker audio="alice-sounds-animals-cow-2.opus">.`
    );
}

export function horse(horse: Character, random100: number) {
    const come = riddenCapitalized(horse);
    const soundNumber = (random100 % 2) + 1;

    return createSpeech(
        `${come} ${nom(horse)}.`,
        `${come} ${nom(horse)} - <speaker audio="alice-sounds-animals-horse-${soundNumber}.opus">.`
    );
}

export function chicken(chicken: Character) {
    const come = comeRunningCapitalized(chicken);

    return createSpeech(
        `${come} ${nom(chicken)}.`,
        `${come} ${nom(chicken)} - <speaker audio="alice-sounds-animals-chicken-1.opus">.`
    );
}

export function frog(frog: Character) {
    const come = riddenCapitalized(frog);

    return createSpeech(
        `${come} ${nom(frog)}.`,
        `${come} ${nom(frog)} - <speaker audio="alice-sounds-animals-frog-1.opus">.`
    );
}

export function rooster(rooster: Character) {
    const come = flownCapitalized(rooster);

    return createSpeech(
        `${come} ${nom(rooster)}.`,
        `${come} ${nom(rooster)} - <speaker audio="alice-sounds-animals-rooster-1.opus">.`
    );
}

export function owl(owl: Character, random100) {
    const come = flownCapitalized(owl);
    const soundNumber = sample([1, 2], random100);

    return createSpeech(
        `${come} ${nom(owl)}.`,
        `${come} ${nom(owl)} - <speaker audio="alice-sounds-animals-owl-${soundNumber}.opus">.`
    );
}

export function dog(dog: Character, random100) {
    const come = comeRunningCapitalized(dog);
    const soundNumber = sample([3, 5], random100);

    return createSpeech(
        `${come} ${nom(dog)}.`,
        `${come} ${nom(dog)} - <speaker audio="alice-sounds-animals-dog-${soundNumber}.opus">.`
    );
}

export function mouse(mouse: Character) {
    const come = comeRunningCapitalized(mouse);

    return createSpeech(
        `${come} ${nom(mouse)}.`,
        `${come} ${nom(mouse)} - <speaker audio="alice-music-violin-b-1.opus">.`
    );
}

function called(char: Character) {
    return byGender(char, 'позвал', 'позвала', 'позвало');
}

function byGender<T>(char: Character, male: T, famela: T, other: T) {
    if (isCharMale(char) || isCharUnisex(char)) {
        return male;
    }

    return isCharFamela(char) ? famela : other;
}

function elephant(random100: number): Speech {
    const n = sample([1, 2], random100);
    return createSpeech('', `<speaker audio="alice-sounds-animals-elephant-${n}.opus">`, {
        ttsOnly: true
    });
}

function sea(): Speech {
    return createSpeech('', `<speaker audio="alice-sounds-nature-sea-1.opus">`, {
        ttsOnly: true
    });
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

// function guitar(random100: number): Speech {
//     const accoud = sample(['a', 'c', 'e', 'g'], random100);
//     return createSpeech('', `<speaker audio="alice-music-guitar-${accoud}-1.opus">`, {
//         ttsOnly: true
//     });
// }

// function delay(times: number): Speech {
//     return createSpeech('', '-' + _.repeat(' -', times - 1), {
//         ttsOnly: true
//     });
// }
