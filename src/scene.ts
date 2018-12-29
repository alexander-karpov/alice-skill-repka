import { Speech, tts } from './speech';
import * as answers from './answers';
import * as intents from './intents';
import { Token } from './tokens';
import { Character, createChar, Gender } from './character';
import { GameMode } from './sessionData';

export enum Scene {
    Intro = 'Intro',
    Repka = 'Repka',
    RepeatOffer = 'RepeatOffer',
}

type SceneDependencies = {
    random100: number;
    tokens: Token[];
    mode: GameMode;
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
    [Scene.Repka]() {
        return {
            speech: tts``,
        };
    },
    [Scene.RepeatOffer]({ tokens, mode }) {
        const nextMode = mode === GameMode.Classic ? GameMode.BlackCity : GameMode.Classic;

        if (intents.no(tokens)) {
            return {
                speech: answers.endOfStory(),
                chars: [],
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
