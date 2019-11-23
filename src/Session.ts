import { Character } from './Character';
import { Scene } from './scene';
import { last } from './utils';

export class Session {
    private constructor(
        private readonly scene: Scene,
        private readonly chars: readonly Character[],
        readonly createdOn: number
    ) {}

    static start(time: number) {
        return new Session(Scene.Intro, [], time);
    }

    get currentScene(): Scene {
        return this.scene;
    }

    get currentCharacters(): readonly Character[] {
        return this.chars;
    }

    assign(scene?: Scene, chars?: readonly Character[]) {
        return new Session(scene || this.scene, chars || this.chars, this.createdOn);
    }

    findLastCharacter(): Character | undefined {
        return last(this.chars);
    }
}
