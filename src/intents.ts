import { Token } from './tokens';
import { Character } from './character';
import { matchSeq } from './utils/seq';

export function repka(tokens: Token[]) {
    return tokens.some(t => t.lexemes.length === 1 && t.lexemes[0].lex === 'репка');
}

export function granny(char: Character) {
    return equals(char, 'бабка', 'бабушка', 'баба');
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

export function horse(char: Character) {
    return startsWith(char, 'лошад', 'жереб') || equals(char, 'конь');
}

export function frog(char: Character) {
    return startsWith(char, 'лягуш');
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

export function help(tokens: Token[]) {
    const text = tokens.map(t => t.text).join(' ');
    return text === 'что ты умеешь' || text === 'помощь';
}

export function wantsRepeat(tokens: Token[]) {
    const text = tokens.map(t => t.text);
    return text.some(t =>
        ['да', 'давай', 'давайте', 'продолжай', 'ладно', 'хочу', 'заново', 'хотим'].includes(t),
    );
}

export function notWantRepeat(tokens: Token[]) {
    function eq<T>(value: T) {
        return (x: T) => (x === value ? x : undefined);
    }

    const text = tokens.map(t => t.text);

    return Boolean(
        text.includes('достаточно') ||
            text.includes('хватит') ||
            text.includes('нет') ||
            text.join(' ').includes('не надо'),
    );
}

export function myself([token]: Token[]) {
    return ['я', 'меня'].includes(token.text);
}

function startsWith(char: Character, ...aliases: string[]) {
    return aliases.some(alias => char.normal.startsWith(alias));
}
function equals(char: Character, ...alias: string[]) {
    return alias.some(alias => char.normal === alias);
}
