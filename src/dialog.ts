import * as _ from 'lodash';
import { Stemmer } from './stemmer';
import { Person } from './Profile';

//#region types
export type DialogContext = {
    stemmer: Stemmer;
    persons: Person[];
};
//#endregion


export async function dialog(command: string, { stemmer, persons }: DialogContext) {
    const tokens = await stemmer(command);
    const [newPersonNom] = tokens.findNouns();
    const lastPerson = _.last(persons);

    if (!lastPerson) {
        persons.push({ nom: 'дедка', creat: 'дедку' })
        return 'Посадил дед репку. Выросла репка большая-пребольшая. Стал дед репку из земли тянуть. Тянет-потянет, вытянуть не может. Позвал дед... Кого?';
    }

    if (!newPersonNom) {
        return `Позвал ${lastPerson.nom}... Кого?`
    }

    persons.push({ nom: newPersonNom, creat: command.toLowerCase() })

    const pull: string[] = [];
    _.reduceRight(persons, (who, pullWho) => {
        pull.push(`${who.nom} за ${pullWho.creat},`);
        return pullWho;
    })

    return _.capitalize(pull.join(' ')) + ' дедка за репку — тянут-потянут, вытянуть не могут.';
}
