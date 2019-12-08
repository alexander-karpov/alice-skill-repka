import { ExpFlag } from './ExpFlag';
import { Scenario } from './Scenario';
import { ScenarioClassic } from './ScenarioClassic';
import { ScenarioThings } from './ScenarioThings';
import { ScenarioCities } from './ScenarioCities';
import { ScenarioRhymes } from './ScenarioRhymes';

export class ScenarioResolver {
    resolve(exps: ExpFlag[]): Scenario {
        if (exps.includes(ExpFlag.Cities)) {
            return new ScenarioCities();
        }

        if (exps.includes(ExpFlag.Things)) {
            return new ScenarioThings();
        }

        if (exps.includes(ExpFlag.Rhymes)) {
            return new ScenarioRhymes();
        }

        return new ScenarioClassic();
    }
}
