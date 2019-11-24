import { Token, isTokenIncludesLex } from './tokens';
import { Character } from './Character';

export function granny(char: Character) {
    return char.equals('бабка', 'бабушка', 'баба');
}

export function grandfather(char: Character) {
    return char.startsWith('дед');
}

export function alice(char: Character) {
    return char.equals('алиса');
}

export function harryPotter(char: Character) {
    return char.nominative.toLocaleLowerCase() === 'гарри поттер';
}

export function cat(char: Character) {
    return char.startsWith('кош', 'кот', 'киск', 'мурк');
}

export function elephant(char: Character) {
    return char.startsWith('слон');
}

export function fish(char: Character) {
    return char.equals('рыба', 'рыбка');
}

export function wolf(char: Character) {
    return char.startsWith('волк', 'волч');
}

export function crow(char: Character) {
    return char.startsWith('ворон');
}

export function cow(char: Character) {
    return char.startsWith('коров');
}

export function chicken(char: Character) {
    return char.startsWith('куриц', 'курочк');
}

export function lion(char: Character) {
    return char.startsWith('льв') || char.equals('лев');
}

export function rooster(char: Character) {
    return char.startsWith('петух', 'петуш');
}

export function dog(char: Character) {
    return (
        char.equals('пес') ||
        char.equals('песик') ||
        char.equals('жучка') ||
        char.startsWith('собак', 'собач', 'щено')
    );
}

export function owl(char: Character) {
    return char.startsWith('сова', 'совен', 'филин', 'совуш', 'совун');
}

export function mouse(char: Character) {
    return char.startsWith('мыш');
}

export function bear(char: Character) {
    return char.equals('мишка', 'мишутка') || char.startsWith('медвед', 'медвеж');
}

export function fox(char: Character) {
    return char.startsWith('лис');
}

export function girl(char: Character) {
    return char.equals('внучка', 'девочка', 'маша');
}

export function zombie(char: Character) {
    return char.equals('зомби');
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
            text.join(' ').includes('не надо')
    );
}

function isIncludeAnyLex(ts: Token[], cases: string[]) {
    return ts.some(t => cases.some(c => isTokenIncludesLex(t, c)));
}
