import { ScenarioClassic } from './ScenarioClassic';
import { Scene } from './Scene';
import { Scenario } from './Scenario';
import { Character } from './Character';
import { sample } from './utils';
import * as answers from './answers';
import { speak } from './speech';
import { KnownChar } from './knownChars';

import dict = require('./nouns.json');

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
    ) {
        let normalWithAccent: string | undefined = undefined;
        let rhymedPart = speak('');

        for (let word of dict) {
            if (word.replace('+', '') === char.normal) {
                normalWithAccent = word;
            }
        }

        if (normalWithAccent) {
            const ending = getEnding(normalWithAccent);
            const rhymes = dict.filter(w => w.endsWith(ending) && w !== normalWithAccent);
            const rhyme = sample(rhymes, random100);
            const rhymeSpeach = speak([rhyme.replace('+', ''), rhyme]);

            if (rhymes.length) {
                const helpYou = sample(
                    ['Помогу вам.', 'Буду помогать.', 'Помогу вытянуть репку.'],
                    random100
                );

                rhymedPart = speak(`Я ${char.nominative}. У меня есть`, rhymeSpeach, '.', helpYou);
            }
        }

        const allChars = chars.concat(char);
        const chain = answers.formatStory(allChars);

        return speak(rhymedPart, chain);
    }
}

function getEnding(word: string): string {
    const accentIndex = word.indexOf('+');

    if (accentIndex === -1) {
        return '';
    }

    return word.substr(accentIndex);
}
