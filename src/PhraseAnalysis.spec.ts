import { Gr } from './PhraseAnalysis';
import {
    дворе_стали_маша,
    _1500_калорий_в_день,
    я_съел_42_калории,
    сколько_осталось
} from './stemmer.examples';

test('hasLemma', async () => {
    expect(дворе_стали_маша.hasLemma('становиться')).toBe(true);
    expect(дворе_стали_маша.hasLemma('сталь')).toBe(true);
    expect(дворе_стали_маша.hasLemma('двор')).toBe(true);
    expect(дворе_стали_маша.hasLemma('махать')).toBe(true);

    expect(дворе_стали_маша.hasLemma('дворе')).toBe(false);
    expect(дворе_стали_маша.hasLemma('стать')).toBe(false);
    expect(дворе_стали_маша.hasLemma('маше')).toBe(false);
});

test('hasLemma with params', async () => {
    expect(я_съел_42_калории.hasLemma('съедать', Gr.Verb)).toBe(true);
    expect(я_съел_42_калории.hasLemma('съедать', Gr.Praet)).toBe(true);
    expect(я_съел_42_калории.hasLemma('съедать', Gr.Verb, Gr.Praet)).toBe(true);

    expect(я_съел_42_калории.hasLemma('съедать', Gr.Noun)).toBe(false);
    expect(я_съел_42_калории.hasLemma('съедать', Gr.Praes)).toBe(false);
    expect(я_съел_42_калории.hasLemma('съедать', Gr.Verb, Gr.Praes)).toBe(false);
    expect(я_съел_42_калории.hasLemma('съедать', Gr.Noun, Gr.Praet)).toBe(false);
});

test('hasNoun', async () => {
    expect(дворе_стали_маша.hasNoun('сталь')).toBe(true);
    expect(дворе_стали_маша.hasNoun('двор')).toBe(true);

    expect(дворе_стали_маша.hasNoun('становиться')).toBe(false);
    expect(дворе_стали_маша.hasNoun('махать')).toBe(false);
});

test('hasVerb', async () => {
    expect(дворе_стали_маша.hasVerb('становиться')).toBe(true);
    expect(дворе_стали_маша.hasVerb('махать')).toBe(true);

    expect(дворе_стали_маша.hasVerb('сталь')).toBe(false);
    expect(дворе_стали_маша.hasVerb('двор')).toBe(false);
});

test('hasNumber', async () => {
    expect(_1500_калорий_в_день.hasNumber()).toBe(true);

    expect(дворе_стали_маша.hasNumber()).toBe(false);
});

test('findNumber', async () => {
    expect(_1500_калорий_в_день.findNumber()).toBe('1500');

    expect(дворе_стали_маша.findNumber()).toBe(undefined);
});

test('hasPretext', async () => {
    expect(_1500_калорий_в_день.hasPretext('в')).toBe(true);

    expect(дворе_стали_маша.hasPretext('сталь')).toBe(false);
});

test('findNouns', async () => {
    expect(дворе_стали_маша.findNouns()).toEqual(['двор', 'сталь', 'маша']);
    expect(сколько_осталось.findNouns()).toEqual([]);
});
