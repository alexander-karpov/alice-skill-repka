import { ExpFlag } from './ExpFlag';

/**
 * Разделяет пользователей на участников экспериментов.
 */
export class ExperimentsResolver {
    // ВНИМАНИЕ. Не меняй порядок экспериментов в массиве
    private readonly experiments: readonly ExpFlag[] = ['cities', 'things'];

    resolve(userId: string): ExpFlag[] {
        // Id пользователя состоит из символов от 0 до F
        return this.experiments.filter((_exp, index) => userId[index] <= '7');
    }
}
