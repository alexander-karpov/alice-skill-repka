import { ScenarioClassic } from './ScenarioClassic';
import { Token } from './tokens';
import { Scene } from './Scene';
import { Scenario } from './Scenario';
import { Character } from './Character';
import { SceneParams } from './SceneParams';

/**
 * Можно звать на помошь Вещи, неодушевленных персонажей
 */
export class ScenarioThings extends ScenarioClassic {
    create(scene: Scene): Scenario {
        return new ScenarioThings(scene);
    }

    /**
     * Пропускает так же неодушевленных персонажей
     */
    discardCharacter(char: Character, params: SceneParams) {
        if (char.isThing) {
            return undefined;
        }

        return super.discardCharacter(char, params);
    }
}
