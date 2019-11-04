import { Token, isTokenIncludesLex } from './tokens';
import { Character } from './character';

export function granny(char: Character) {
    return equals(char, 'бабка', 'бабушка', 'баба');
}

export function grandfather(char: Character) {
    return startsWith(char, 'дед');
}

export function alice(char: Character) {
    return equals(char, 'алиса');
}

export function harryPotter(char: Character) {
    return char.subject.nominative.toLocaleLowerCase() === 'гарри поттер';
}

export function cat(char: Character) {
    return startsWith(char, 'кош', 'кот', 'киск', 'мурк');
}

export function elephant(char: Character) {
    return startsWith(char, 'слон');
}

export function fish(char: Character) {
    return equals(char, 'рыба', 'рыбка');
}

export function wolf(char: Character) {
    return startsWith(char, 'волк', 'волч');
}

export function crow(char: Character) {
    return startsWith(char, 'ворон');
}

export function cow(char: Character) {
    return startsWith(char, 'коров');
}

export function chicken(char: Character) {
    return startsWith(char, 'куриц', 'курочк');
}

export function lion(char: Character) {
    return startsWith(char, 'льв') || equals(char, 'лев');
}

export function rooster(char: Character) {
    return startsWith(char, 'петух', 'петуш');
}

export function dog(char: Character) {
    return (
        equals(char, 'пес') ||
        equals(char, 'песик') ||
        equals(char, 'жучка') ||
        startsWith(char, 'собак', 'собач', 'щено')
    );
}

export function owl(char: Character) {
    return startsWith(char, 'сова', 'совен', 'филин', 'совуш', 'совун');
}

export function mouse(char: Character) {
    return startsWith(char, 'мыш');
}

export function bear(char: Character) {
    return equals(char, 'мишка', 'мишутка') || startsWith(char, 'медвед', 'медвеж');
}

export function fox(char: Character) {
    return startsWith(char, 'лис');
}

export function girl(char: Character) {
    return equals(char, 'внучка', 'девочка', 'маша');
}

export function zombie(char: Character) {
    return equals(char, 'зомби');
}

export function help(tokens: Token[]) {
    const text = tokens.map(t => t.text).join(' ');
    return text === 'что ты умеешь' || text === 'помощь';
}

export function wantsRepeat(tokens: Token[]) {
    return isIncludeAnyLex(tokens, [
        'да',
        'давать',
        'продолжать',
        'ладно',
        'хотеть',
        'заново',
        'снова',
        'сначала',
    ]);
}

export function notWantRepeat(tokens: Token[]) {
    const text = tokens.map(t => t.text);

    return Boolean(
        text.includes('достаточно') ||
            text.includes('хватит') ||
            text.includes('нет') ||
            text.includes('конец') ||
            text.includes('пока') ||
            text.join(' ').includes('не надо'),
    );
}

export function you(tokens: Token[]) {
    return tokens.length === 1 && isTokenIncludesLex(tokens[0], 'ты');
}

function startsWith(char: Character, ...aliases: string[]) {
    return aliases.some(alias => char.normal.startsWith(alias));
}
function equals(char: Character, ...alias: string[]) {
    return alias.some(alias => char.normal === alias);
}

function isIncludeAnyLex(ts: Token[], cases: string[]) {
    return ts.some(t => cases.some(c => isTokenIncludesLex(t, c)));
}
