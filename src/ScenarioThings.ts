import { ScenarioClassic } from './ScenarioClassic';
import { Token } from './tokens';
import { Scene } from './Scene';
import { Scenario } from './Scenario';

/**
 * Можно звать на помошь Вещи, неодушевленных персонажей
 */
export class ScenarioThings extends ScenarioClassic {
    create(scene: Scene): Scenario {
        return new ScenarioThings(scene);
    }

    /**
     * Распознаёт вещь как персонажа
     */
    recognizeCharacter(tokens: Token[]) {
        return super.recognizeCharacter(tokens) || super.recognizeThing(tokens);
    }
}
