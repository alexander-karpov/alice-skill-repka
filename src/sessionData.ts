import { Character } from './character';
import { Scene } from './scene';

export enum GameMode {
    Classic = 'Classic',
    BlackCity = 'BackCity',
}

export type SessionData = {
    chars: Character[];
    mode: GameMode;
    scene: Scene;
    isNewSession: boolean;
};

export function createSessionData(): SessionData {
    return {
        chars: [],
        isNewSession: false,
        mode: GameMode.Classic,
        scene: Scene.Intro,
    };
}
