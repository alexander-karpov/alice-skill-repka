export function upperFirst(str: string): string {
    if (!str) {
        return str;
    }

    return `${str[0].toUpperCase()}${str.substr(1)}`;
}
