export function sample<TItem>(items: TItem[], random: number) {
    return items[random % items.length];
}
