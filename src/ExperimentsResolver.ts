import { ExpFlag } from './ExpFlag';

/**
 * Разделяет пользователей на участников экспериментов.
 */
export class ExperimentsResolver {
    resolve(userId: string): ExpFlag[] {
        // Id пользователя состоит из символов от 0 до F
        const firstLetter = userId[0].toLocaleLowerCase();

        if (['0', '1', '2', '3'].includes(firstLetter)) {
            return [ExpFlag.Cities];
        }

        if (['4', '5', '6', '7'].includes(firstLetter)) {
            return [ExpFlag.Things];
        }

        if (['8', '9', 'а', 'b'].includes(firstLetter)) {
            return [ExpFlag.Rhymes];
        }

        return [];
    }
}
