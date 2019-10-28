import { last } from './utils';
import * as answers from './answers';
import * as intents from './intents';
import { Speech, tts, speak } from './speech';
import { Token } from './tokens';
import { Character, createChar, Gender } from './character';
import { findKnownChar, chooseKnownCharButtons, KnownChar } from './knownChars';
import { extractChar, extractInanimate } from './extractChar';
import { cutText } from './utils';

export enum Scene {
    Intro = 'Intro',
    Repka = 'Repka',
    RepeatOffer = 'RepeatOffer',
}

export type SceneButton = {
    text: string;
    url?: string;
};

type SceneDependencies = {
    random100: number;
    tokens: Token[];
    chars: Character[];
};

type SceneResult = {
    speech: Speech;
    chars?: Character[];
    next?: Scene;
    endSession?: boolean;
    imageId?: string;
    buttons?: SceneButton[];
};

const DEDKA = createChar('дедка', 'дедку', 'дедка', Gender.Male);

export const scenes: { [name in Scene]: (deps: SceneDependencies) => SceneResult } = {
    [Scene.Intro]({ random100 }) {
        return {
            speech: answers.intro(random100),
            chars: [DEDKA],
            next: Scene.Repka,
        };
    },
    [Scene.Repka]({ tokens, chars, random100 }) {
        const currentChar = last(chars) as Character;
        const nextChar = extractChar(tokens);
        const inanimate = extractInanimate(tokens);

        if (!nextChar && inanimate) {
            return {
                speech: answers.inanimateCalled(inanimate, currentChar),
                buttons: knownCharButtons(chars, random100),
            };
        }

        if (!nextChar) {
            return {
                speech: answers.wrongCommand(currentChar),
                buttons: knownCharButtons(chars, random100),
            };
        }

        const knownChar = findKnownChar(nextChar);
        const tale = makeRepkaTale(chars, nextChar, knownChar, random100);
        const isEnd = isTaleEnd(tale, nextChar);
        const end = isEnd ? answers.success() : answers.failure(nextChar);
        const taleWithEnd = speak(tale, end);
        const image = knownChar && knownChar.image;
        const buttons = makeButtons([...chars, nextChar], isEnd, random100);
        const cutTale = image
            ? speak([cutText(taleWithEnd.text, 254), cutText(taleWithEnd.tts, 1023)])
            : speak([cutText(taleWithEnd.text, 1023), cutText(taleWithEnd.tts, 1023)]);
        const next = isEnd ? Scene.RepeatOffer : Scene.Repka;

        return {
            speech: cutTale,
            buttons,
            imageId: image,
            chars: chars.concat(nextChar),
            next,
        };
    },
    [Scene.RepeatOffer]({ tokens }) {
        if (intents.notWantRepeat(tokens)) {
            return {
                speech: answers.endOfStory(),
                chars: [DEDKA],
                next: Scene.Repka,
                endSession: true,
            };
        }

        if (intents.wantsRepeat(tokens)) {
            return {
                speech: answers.storyBegin(),
                chars: [DEDKA],
                next: Scene.Repka,
            };
        }

        return { speech: answers.yesOrNoExpected(), buttons: storyEndButtons() };
    },
};

function makeRepkaTale(
    chars: Character[],
    char: Character,
    knownChar: KnownChar | undefined,
    random100: number,
) {
    const allChars = chars.concat(char);
    const previousChar = last(chars) as Character;
    const chain = answers.formatStory(allChars);
    const knownAnswer = knownChar ? knownChar.answer(char, previousChar, random100) : speak();

    return speak(knownAnswer, chain);
}

function isTaleEnd(tale: Speech, nextChar: Character) {
    const taleLength = Math.max(tale.text.length, tale.tts.length);

    const isLastMouse = nextChar.normal.startsWith('мыш');
    /**  Максимальная длинна text и tts - 1024 */
    const isTaleTooLong = taleLength >= 800;

    return isLastMouse || isTaleTooLong;
}

function makeButtons(chars: Character[], isEnd: boolean, random100: number): SceneButton[] {
    // Дадим ребенку сначала понять, что можно
    // самому придумывать персонажей.
    if (chars.length < 4) {
        return [];
    }

    if (isEnd) {
        return storyEndButtons();
    }

    return knownCharButtons(chars, random100);
}

function knownCharButtons(chars: Character[], random100: number): SceneButton[] {
    return chooseKnownCharButtons(chars, random100).map(text => ({ text }));
}

function storyEndButtons(): SceneButton[] {
    return [
        { text: 'Да' },
        { text: 'Нет' },
        {
            text: '❤️ Поставить оценку',
            url: 'https://dialogs.yandex.ru/store/skills/916a8380-skazka-pro-repku',
        },
    ];
}
