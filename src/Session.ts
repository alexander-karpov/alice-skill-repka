import { Character } from './Character';
import { Scene } from './Scene';
import { last } from './utils';
import { Scenario } from './Scenario';
import { ScenarioClassic } from './ScenarioClassic';

export class Session {
    private constructor(
        private readonly chars: readonly Character[],
        readonly scenario: Scenario,
        readonly createdOn: number
    ) {}

    static start(time: number) {
        return new Session([], new ScenarioClassic('intro'), time);
    }

    get currentCharacters(): readonly Character[] {
        return this.chars;
    }

    assign(scenario: Scenario, chars?: readonly Character[]) {
        return new Session(chars || this.chars, scenario, this.createdOn);
    }

    findLastCharacter(): Character | undefined {
        return last(this.chars);
    }
}
