import * as answers from './answers';
import { Character } from './Character';
import { Predicate } from './core';
import * as intents from './intents';
import { sample } from './utils';

export type KnownChar = {
    button: string;
    normal: string;
    image: string;
    trigger: Predicate<Character>;
    answer: answers.AnswerBuilder;
};

export function findKnownChar(char: Character) {
    return Object.values(knownChars).find(c => c.trigger(char));
}

export function chooseKnownCharButtons(
    allChars: readonly Character[],
    random100: number,
    startsWith?: string
): string[] {
    const notCalledKnownChars = Object.values(knownChars)
        .filter(
            c =>
                c !== knownChars.mouse &&
                c !== knownChars.zombie &&
                c !== knownChars.alice &&
                c !== knownChars.harryPotter &&
                (!startsWith || c.normal.startsWith(startsWith))
        )
        .filter(known => !allChars.some(known.trigger));

    if (notCalledKnownChars.length === 0 && !startsWith) {
        return [knownChars.mouse.button];
    }

    if (notCalledKnownChars.length <= 2) {
        return notCalledKnownChars.map(c => c.button);
    }

    return [
        sample(notCalledKnownChars, random100).button,
        sample(notCalledKnownChars, random100 + 1).button,
    ];
}

//     cr_eateChar('коровушка', 'коровушку', 'коровушка', Gender.Famela),
//     cr_eateChar('лошадка', 'лошадку', 'лошадка', Gender.Famela)
//      cr_eateChar('лягушка', 'лягушку', 'лягушка', Gender.Famela)

const knownChars = {
    wolf: {
        button: '🐺 Серого волка',
        normal: 'волк',
        trigger: intents.wolf,
        answer: answers.chars.wolf,
        image: '965417/9929614145838c2092ab',
    } as KnownChar,
    crow: {
        button: '🐦 Ворону',
        normal: 'ворона',
        trigger: intents.crow,
        answer: answers.chars.crow,
        image: '997614/61c6fab9d5da7f3a5eba',
    } as KnownChar,
    cat: {
        button: '🐱 Маленького котёнка',
        normal: 'котёнк',
        trigger: intents.cat,
        answer: answers.chars.cat,
        image: '1540737/52f138d32164dcfb334b',
    } as KnownChar,
    mouse: {
        button: '🐭 Мышку',
        normal: 'мышка',
        trigger: intents.mouse,
        answer: answers.chars.mouse,
        image: '1652229/dec46e3a051abd7eef90',
    } as KnownChar,
    dog: {
        button: '🐶 Собаку',
        normal: 'собака',
        trigger: intents.dog,
        answer: answers.chars.dog,
        image: '1030494/fb311cc1fb2cb7fafa8a',
    } as KnownChar,
    granny: {
        button: '👵 Бабушку',
        normal: 'бабушка',
        trigger: intents.granny,
        answer: answers.chars.granny,
        image: '965417/3f0555dd5901a0823e39',
    } as KnownChar,
    lion: {
        button: '🦁 Большого льва',
        normal: 'лев',
        trigger: intents.lion,
        answer: answers.chars.lion,
        image: '965417/e6c5fce891628ea6db10',
    } as KnownChar,
    elephant: {
        button: '🐘 Слона',
        normal: 'слон',
        trigger: intents.elephant,
        answer: answers.chars.elephant,
        image: '1540737/8d397cb056499591db59',
    } as KnownChar,
    rooster: {
        button: '🐓 Петушка',
        normal: 'петушок',
        trigger: intents.rooster,
        answer: answers.chars.rooster,
        image: '965417/d12602b30f51439b55b3',
    } as KnownChar,
    owl: {
        button: '🦉Сову',
        normal: 'сова',
        trigger: intents.owl,
        answer: answers.chars.owl,
        image: '1030494/246c82db66034ba90a3f',
    } as KnownChar,
    chicken: {
        button: '🐔 Курочку',
        normal: 'курочка',
        trigger: intents.chicken,
        answer: answers.chars.chicken,
        image: '213044/bb381ed46a4a6ed4cf2b',
    } as KnownChar,
    bear: {
        button: '🐻 Бурого мишку',
        normal: 'мишка',
        trigger: intents.bear,
        answer: answers.chars.bear,
        image: '1656841/1683fc7e7260af4218c4',
    } as KnownChar,
    fox: {
        button: '🦊 Лисичку',
        normal: 'лисичка',
        trigger: intents.fox,
        answer: answers.chars.fox,
        image: '965417/a07c3f1a434e63760055',
    } as KnownChar,
    fish: {
        button: '🐠 Золотую рыбку',
        normal: 'рыбка',
        trigger: intents.fish,
        answer: answers.chars.fish,
        image: '',
    } as KnownChar,
    girl: {
        button: '👧 Внучку',
        normal: 'внучка',
        trigger: intents.girl,
        answer: answers.chars.girl,
        image: '965417/04042969d5ad6db34bc3',
    } as KnownChar,
    zombie: {
        button: '🧟‍ Зомби',
        normal: 'зомби',
        trigger: intents.zombie,
        answer: answers.chars.zombie,
        image: '',
    } as KnownChar,
    grandfather: {
        button: '👴 Дедушку',
        normal: 'дедушка',
        trigger: intents.grandfather,
        answer: answers.chars.grandfather,
        image: '',
    } as KnownChar,
    alice: {
        button: '📱 Алису',
        normal: 'алиса',
        trigger: intents.alice,
        answer: answers.chars.alice,
        image: '1030494/941a763ac0fcc18e2be8',
    } as KnownChar,
    harryPotter: {
        button: '🧙‍♂️ Гарри Поттер',
        normal: 'гарри поттер',
        trigger: intents.harryPotter,
        answer: answers.chars.harryPotter,
        image: '',
    } as KnownChar,
};
