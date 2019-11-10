import { Character } from './character';
import { Scene } from './scene';
import { last } from './utils';

export class Session {
    private constructor(
        private readonly scene: Scene,
        private readonly chars: readonly Character[],
        public readonly createdOn: number,
    ) {}

    static create(time: number) {
        return new Session(Scene.Intro, [], time);
    }

    assign(scene?: Scene, chars?: readonly Character[]) {
        return new Session(scene || this.scene, chars || this.chars, this.createdOn);
    }

    get currentScene(): Scene {
        return this.scene;
    }

    get currentCharacters(): readonly Character[] {
        return this.chars;
    }

    findLastCharacter(): Character | undefined {
        return last(this.chars);
    }
}
