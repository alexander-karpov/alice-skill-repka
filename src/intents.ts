import { Gr, findLexeme, Token } from './tokens';
import { Character } from './character';
import { matchSeq } from './utils/seq';

export function hasMultipleChars(tokens: Token[]) {
    return tokens.some(t => !!findLexeme(t, [Gr.S, Gr.Acc, Gr.anim, Gr.plural]));
}

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
    return startsWith(char, 'собак', 'собач', 'щено', 'жучка') || equals(char, 'пес');
}

export function owl(char: Character) {
    return startsWith(char, 'сова', 'совен', 'филин');
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

export function help(tokens: string[]) {
    const command = tokens.join(' ');
    return command === 'что ты умеешь' || command === 'помощь';
}

export function yes(tokens: string[]) {
    return tokens.some(t => ['да', 'давай', 'давайте', 'продолжай', 'ладно', 'хочу'].includes(t));
}

export function no(tokens: string[]) {
    function eq<T>(value: T) {
        return (x: T) => (x === value ? x : undefined);
    }

    return Boolean(
        tokens.includes('достаточно') ||
            tokens.includes('хватит') ||
            tokens.includes('нет') ||
            matchSeq(tokens, [eq('не'), eq('надо')]),
    );
}

function startsWith(char: Character, ...aliases: string[]) {
    return aliases.some(alias => char.normal.startsWith(alias));
}
function equals(char: Character, ...alias: string[]) {
    return alias.some(alias => char.normal === alias);
}
