import { Character } from './character';
import { Scene } from './scene';

export type SessionData = {
    chars: Character[];
    scene: Scene;
    isNewSession: boolean;
};

export function createSessionData(): SessionData {
    return {
        chars: [],
        isNewSession: false,
        scene: Scene.Intro,
    };
}
