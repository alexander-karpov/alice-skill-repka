import { Character } from './Character';
import { Scene } from './Scenes';
import { last } from './utils';
import { Scenario } from './Scenario';
import { ScenarioClassic } from './ScenarioClassic';

export class Session {
    private constructor(
        private readonly scene: Scene,
        private readonly chars: readonly Character[],
        readonly scenario: Scenario,
        readonly createdOn: number
    ) {}

    static start(time: number) {
        return new Session('intro', [], new ScenarioClassic(), time);
    }

    get currentScene(): Scene {
        return this.scene;
    }

    get currentCharacters(): readonly Character[] {
        return this.chars;
    }

    assign(scene?: Scene, chars?: readonly Character[]) {
        return new Session(scene || this.scene, chars || this.chars, this.scenario, this.createdOn);
    }

    findLastCharacter(): Character | undefined {
        return last(this.chars);
    }
}
