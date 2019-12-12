import { ScenarioClassic } from './ScenarioClassic';
import { Scene } from './Scene';
import { Scenario } from './Scenario';
import { Character } from './Character';
import { sample } from './utils';
import * as answers from './answers';
import { speak, Speech } from './speech';
import { KnownChar } from './knownChars';

import { Rhymer } from './Rhymer';
const rhymer = new Rhymer();

/**
 * Добавляет к истории рифмы типа «Я внучка. У меня есть ручка.»
 */
export class ScenarioRhymes extends ScenarioClassic {
    create(scene: Scene): Scenario {
        return new ScenarioRhymes(scene);
    }

    /**
     * Текст сказки без окончания. Кто за кем.
     */
    protected makeRepkaTale(
        chars: readonly Character[],
        char: Character,
        knownChar: KnownChar | undefined,
        random100: number
    ): Speech {
        const chain = answers.formatStory(chars.concat(char));
        const iAm = speak([`Я ${char.nominative}.`, `Я ${char.nominativeTts}.`]);

        const iHelpYou = sample(
            ['Помогу вам.', 'Буду помогать.', 'Помогу вытянуть репку.'],
            random100
        );

        const rhyme = rhymer.findRhymes(char.normal, random100);

        if (rhyme) {
            const iHave = speak(`У меня есть ${rhyme}.`);

            return speak(iAm, iHave, iHelpYou, chain);
        }

        return speak(iAm, iHelpYou, chain);
    }
}
