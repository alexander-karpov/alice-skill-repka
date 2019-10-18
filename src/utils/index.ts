export * from './last';
export * from './random';
export * from './upperFirst';

export function sample<TItem>(items: TItem[], random: number) {
    return items[random % items.length];
}

export function cutText(text: string, length: number): string {
    if (text.length <= length) {
        return text;
    }

    return `${text.substr(0, length - 1)}…`;
}
