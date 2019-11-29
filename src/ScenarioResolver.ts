import { ExpFlag } from './ExpFlag';
import { Scenario } from './Scenario';
import { ScenarioClassic } from './ScenarioClassic';
import { ScenarioThings } from './ScenarioThings';

export class ScenarioResolver {
    resolve(exps: ExpFlag[]): Scenario {
        if (exps.includes('things')) {
            return new ScenarioThings();
        }

        return new ScenarioClassic();
    }
}
