import { ExpFlag } from './ExpFlag';
import { Scenario } from './Scenario';
import { ScenarioClassic } from './ScenarioClassic';
import { ScenarioThings } from './ScenarioThings';
import { ScenarioCities } from './ScenarioCities';

export class ScenarioResolver {
    resolve(exps: ExpFlag[]): Scenario {
        if (exps.includes(ExpFlag.Cities)) {
            return new ScenarioCities();
        }

        if (exps.includes(ExpFlag.Things)) {
            return new ScenarioThings();
        }

        return new ScenarioClassic();
    }
}
