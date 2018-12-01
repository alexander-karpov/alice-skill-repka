export function sample<TItem>(items: TItem[], random: number) {
    return items[random % items.length];
}

export function lazySample<TItem>(items: (() => TItem)[], random: number): TItem {
    return items[random % items.length]();
}
