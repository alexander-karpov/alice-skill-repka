import * as _ from 'lodash';
import * as answers from './answers';
import * as intents from './intents';
import { Speech, tts, speak } from './speech';
import { Token } from './tokens';
import { Character, createChar, Gender } from './character';
import { GameMode } from './sessionData';
import { DialogButton } from './dialog';
import { findKnownChar, chooseKnownCharButtons, KnownChar } from './knownChars';
import { extractChar, extractInanimate } from './extractChar';
import { cutText } from './utils';

export enum Scene {
    Intro = 'Intro',
    Repka = 'Repka',
    RepeatOffer = 'RepeatOffer',
}

type SceneDependencies = {
    random100: number;
    tokens: Token[];
    mode: GameMode;
    chars: Character[];
};

type SceneResult = {
    speech: Speech;
    chars?: Character[];
    next?: Scene;
    mode?: GameMode;
    endSession?: boolean;
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
    [Scene.Repka]({ mode, tokens, chars, random100 }) {
        const isBlackCityDialog = mode === GameMode.BlackCity;
        const currentChar = _.last(chars) as Character;
        const nextChar = extractChar(tokens);
        const inanimate = extractInanimate(tokens);

        if (!nextChar && inanimate) {
            return {
                speech: answers.inanimateCalled(inanimate, currentChar),
                buttons: knownCharButtons(chars, mode, random100),
            };
        }

        if (!nextChar) {
            return {
                speech: answers.wrongCommand(currentChar),
                buttons: knownCharButtons(chars, mode, random100),
            };
        }

        if (isBlackCityDialog && !intents.isBlackCityChar(nextChar)) {
            return { speech: answers.blackCityError(nextChar) };
        }

        const next = isEndOfStory(chars, nextChar, mode) ? Scene.RepeatOffer : Scene.Repka;
        const knownChar = findKnownChar(nextChar);
        const tale = makeRepkaStory(chars, nextChar, knownChar, mode, random100);
        const image = knownChar && knownChar.image;
        const buttons = makeButtons(chars, nextChar, mode, random100);
        const cutTale = image ? speak([cutText(tale.text, 254), tale.tts]) : tale;

        return {
            speech: cutTale,
            buttons,
            imageId: image,
            chars: chars.concat(nextChar),
            next,
        };

        return {
            speech: tts``,
        };
    },
    [Scene.RepeatOffer]({ tokens, mode }) {
        const nextMode = mode === GameMode.Classic ? GameMode.BlackCity : GameMode.Classic;

        if (intents.no(tokens)) {
            return {
                speech: answers.endOfStory(),
                chars: [DEDKA],
                next: Scene.Repka,
                endSession: true,
            };
        }

        if (intents.yes(tokens)) {
            return {
                speech: answers.storyBegin(nextMode),
                chars: [DEDKA],
                next: Scene.Repka,
                mode: nextMode,
            };
        }

        return { speech: answers.yesOrNoExpected() };
    },
};

function makeRepkaStory(
    chars: Character[],
    char: Character,
    knownChar: KnownChar | undefined,
    mode: GameMode,
    random100: number,
) {
    const allChars = chars.concat(char);
    const previousChar = _.last(chars) as Character;
    const chain = answers.formatStory(allChars);
    const end = isEndOfStory(chars, char, mode) ? answers.success() : answers.failure(char);
    const knownAnswer = knownChar ? knownChar.answer(char, previousChar, random100) : speak();

    return speak(knownAnswer, chain, end);
}

function isEndOfStory(chars: Character[], nextChar: Character, mode: GameMode) {
    const isLastMouse = nextChar.normal.startsWith('мыш');
    const maxCharsCount = mode === GameMode.Classic ? 12 : 8;
    const tooManyCharacters = chars.length + 1 >= maxCharsCount;

    return isLastMouse || tooManyCharacters;
}

function makeButtons(
    chars: Character[],
    char: Character,
    mode: GameMode,
    random100: number,
): DialogButton[] {
    // Дадим ребенку сначала понять, что можно
    // самому придумывать персонажей.
    if (chars.length < 3) {
        return [];
    }

    if (isEndOfStory(chars, char, mode)) {
        return storyEndButtons();
    }

    if (mode === GameMode.Classic) {
        return knownCharButtons(chars, mode, random100);
    }

    return [];
}

function knownCharButtons(chars: Character[], mode: GameMode, random100: number): DialogButton[] {
    if (mode === GameMode.Classic) {
        return chooseKnownCharButtons(chars, random100).map(text => ({
            title: text,
            hide: true,
        }));
    }

    return [];
}

function storyEndButtons(): DialogButton[] {
    return [
        { title: 'Да', hide: true },
        { title: 'Нет', hide: true },
        {
            title: 'Поставить оценку',
            url: 'https://dialogs.yandex.ru/store/skills/916a8380-skazka-pro-repku',
            hide: true,
        },
    ];
}
