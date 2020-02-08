import { ExpFlag } from './ExpFlag';
import { Scenario } from './Scenario';
import { ScenarioClassic } from './ScenarioClassic';

export class ScenarioResolver {
    resolve(exps: ExpFlag[]): Scenario {
        return new ScenarioClassic();
    }
}
