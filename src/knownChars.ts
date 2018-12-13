import { Predicate } from './core';
import { Character } from './character';
import * as intents from './intents';
import * as answers from './answers';
import { sample } from './utils';

type KnownChar = {
    name: string;
    button: string;
    image: string;
    trigger: Predicate<Character>;
    answer: answers.AnswerBuilder;
};

export function findKnownChar(char: Character) {
    return knownChars.find(c => c.trigger(char));
}

export function chooseKnownCharButtons(allChars: Character[], random100): string[] {
    const notCalledKnownChars = knownChars.filter(known => !allChars.some(known.trigger));

    if (notCalledKnownChars.length === 0) {
        return [];
    }

    return [sample(notCalledKnownChars, random100).button];
}

//     cr_eateChar('коровушка', 'коровушку', 'коровушка', Gender.Famela),
//     cr_eateChar('лошадка', 'лошадку', 'лошадка', Gender.Famela)
//      cr_eateChar('лягушка', 'лягушку', 'лягушка', Gender.Famela)

const knownChars: KnownChar[] = [
    {
        name: 'wolf',
        button: 'Серого волка',
        trigger: intents.wolf,
        answer: answers.chars.wolf,
        image: '965417/9929614145838c2092ab',
    },
    {
        name: 'crow',
        button: 'Ворону',
        trigger: intents.crow,
        answer: answers.chars.crow,
        image: '997614/61c6fab9d5da7f3a5eba',
    },
    {
        name: 'cat',
        button: 'Маленького котёнка',
        trigger: intents.cat,
        answer: answers.chars.cat,
        image: '1540737/52f138d32164dcfb334b',
    },
    {
        name: 'mouse',
        button: 'Мышку',
        trigger: intents.mouse,
        answer: answers.chars.mouse,
        image: '1652229/dec46e3a051abd7eef90',
    },
    {
        name: 'dog',
        button: 'Собаку',
        trigger: intents.dog,
        answer: answers.chars.dog,
        image: '1030494/fb311cc1fb2cb7fafa8a',
    },
    {
        name: 'granny',
        button: 'Бабушку',
        trigger: intents.granny,
        answer: answers.chars.granny,
        image: '965417/3f0555dd5901a0823e39',
    },
    {
        name: 'lion',
        button: 'Большого льва',
        trigger: intents.lion,
        answer: answers.chars.lion,
        image: '965417/e6c5fce891628ea6db10',
    },
    {
        name: 'elephant',
        button: 'Слона',
        trigger: intents.elephant,
        answer: answers.chars.elephant,
        image: '1540737/8d397cb056499591db59',
    },
    {
        name: 'rooster',
        button: 'Петушка',
        trigger: intents.rooster,
        answer: answers.chars.rooster,
        image: '965417/d12602b30f51439b55b3',
    },
    {
        name: 'owl',
        button: 'Сову',
        trigger: intents.owl,
        answer: answers.chars.owl,
        image: '1030494/246c82db66034ba90a3f',
    },
    {
        name: 'chicken',
        button: 'Курочку',
        trigger: intents.chicken,
        answer: answers.chars.chicken,
        image: '213044/bb381ed46a4a6ed4cf2b',
    },
    {
        name: 'bear',
        button: 'Бурого мишку',
        trigger: intents.bear,
        answer: answers.chars.bear,
        image: '1656841/1683fc7e7260af4218c4',
    },
    {
        name: 'fox',
        button: 'Лисичку',
        trigger: intents.fox,
        answer: answers.chars.fox,
        image: '965417/a07c3f1a434e63760055',
    },
    {
        name: 'fish',
        button: 'Золотую рыбку',
        trigger: intents.fish,
        answer: answers.chars.fish,
        image: '',
    },
    {
        name: 'girm',
        button: 'Внучку',
        trigger: intents.girl,
        answer: answers.chars.girl,
        image: '',
    },
];
