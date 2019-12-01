import { ScenarioClassic } from './ScenarioClassic';
import { Scene } from './Scene';
import { Scenario } from './Scenario';
import { Character } from './Character';
import { SceneParams } from './SceneParams';
import { SceneResult } from './SceneResult';
import { last } from './utils';
import * as answers from './answers';
import { Speech, speak } from './speech';
import { SceneButton } from './SceneButton';
import { chooseKnownCharButtons } from './knownChars';

/**
 * Можно звать на помошь Вещи, неодушевленных персонажей
 */
export class ScenarioCities extends ScenarioClassic {
    create(scene: Scene): Scenario {
        return new ScenarioCities(scene);
    }

    intro(params: SceneParams): SceneResult {
        return {
            ...super.intro(params),
            speech: answers.introCities(),
        };
    }

    /**
     * Принимает только персонажей, название которых
     * начинается на букву, на которую заканчивается предыдущий
     */
    protected discardCharacter(char: Character, params: SceneParams): SceneResult | undefined {
        const base = super.discardCharacter(char, params);

        if (base) {
            return base;
        }

        const previous = last(params.chars) as Character;

        if (char.firstLetter !== previous.lastLetter) {
            return {
                speech: answers.citiesWrongChar(char, previous),
                events: params.events.addThing(char.nominative),
                scenario: this,
            };
        }
    }

    /**
     * Ограничивает предлагаемые кнопки только подходящими персонажами
     */
    protected knownCharButtons(chars: readonly Character[], random100: number): SceneButton[] {
        const previous = last(chars) as Character;

        return chooseKnownCharButtons(chars, random100, previous.lastLetter).map(
            (text: string) => ({ text })
        );
    }
}
