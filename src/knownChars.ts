import { Predicate } from './core';
import { Character } from './character';
import * as intents from './intents';
import * as answers from './answers';

type KnownChar = {
    name: string;
    image: string;
    trigger: Predicate<Character>;
    answer: answers.AnswerBuilder;
};

export function findKnownChar(char: Character) {
    return knownChars.find(c => c.trigger(char));
}

const knownChars: KnownChar[] = [
    {
        name: 'wolf',
        trigger: intents.wolf,
        answer: answers.chars.wolf,
        image: '965417/9929614145838c2092ab',
    },
    {
        name: 'crow',
        trigger: intents.crow,
        answer: answers.chars.crow,
        image: '997614/61c6fab9d5da7f3a5eba',
    },
    {
        name: 'cat',
        trigger: intents.cat,
        answer: answers.chars.cat,
        image: '1540737/52f138d32164dcfb334b',
    },
    {
        name: 'mouse',
        trigger: intents.mouse,
        answer: answers.chars.mouse,
        image: '1652229/dec46e3a051abd7eef90',
    },
    {
        name: 'dog',
        trigger: intents.dog,
        answer: answers.chars.dog,
        image: '1030494/fb311cc1fb2cb7fafa8a',
    },
    {
        name: 'granny',
        trigger: intents.granny,
        answer: answers.chars.granny,
        image: '965417/3f0555dd5901a0823e39',
    },
    {
        name: 'lion',
        trigger: intents.lion,
        answer: answers.chars.lion,
        image: '965417/e6c5fce891628ea6db10',
    },
    {
        name: 'elephant',
        trigger: intents.elephant,
        answer: answers.chars.elephant,
        image: '1540737/8d397cb056499591db59',
    },
    {
        name: 'rooster',
        trigger: intents.rooster,
        answer: answers.chars.rooster,
        image: '965417/d12602b30f51439b55b3',
    },
    {
        name: 'owl',
        trigger: intents.owl,
        answer: answers.chars.owl,
        image: '1030494/246c82db66034ba90a3f',
    },
    {
        name: 'chicken',
        trigger: intents.chicken,
        answer: answers.chars.chicken,
        image: '213044/bb381ed46a4a6ed4cf2b',
    },
    {
        name: 'bear',
        trigger: intents.bear,
        answer: answers.chars.bear,
        image: '1656841/1683fc7e7260af4218c4',
    },
    {
        name: 'fox',
        trigger: intents.fox,
        answer: answers.chars.fox,
        image: '965417/a07c3f1a434e63760055',
    },
    {
        name: 'fish',
        trigger: intents.fish,
        answer: answers.chars.fish,
        image: '',
    },
];
