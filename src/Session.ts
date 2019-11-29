import { Character } from './Character';
import { last } from './utils';
import { Scenario } from './Scenario';

export class Session {
    constructor(
        private readonly chars: readonly Character[],
        readonly scenario: Scenario,
        readonly createdOn: number
    ) {}

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
