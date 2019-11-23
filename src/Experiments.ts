/**
 * Разделяет пользователей на участников экспериментов.
 */
export class Experiments {
    // ВНИМАНИЕ. Не меняй порядок экспериментов в массиве
    private readonly experiments: readonly string[] = ['cities'];

    forUser(userId: string): string[] {
        // Id пользователя состоит из символов от 0 до F
        return this.experiments.filter((_exp, index) => userId[index] <= '7');
    }
}
