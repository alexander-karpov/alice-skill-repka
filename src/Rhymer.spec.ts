import { Rhymer } from './Rhymer';

describe('Rhymer', () => {
    test('Предлагает рифмы', async () => {
        const dict = new Rhymer();

        expect(dict.findRhymes('котик', 0)).toMatch('ботик');
        expect(dict.findRhymes('котик', 1)).toMatch('ротик');
        expect(dict.findRhymes('котик', 2)).toMatch('дротик');
        expect(dict.findRhymes('котик', 3)).toMatch('плотик');
        expect(dict.findRhymes('котик', 4)).toMatch('животик');
        expect(dict.findRhymes('котик', 5)).toMatch('блокнотик');

        expect(dict.findRhymes('медведь', 0)).toMatch('кеть');
        expect(dict.findRhymes('чудовище', 0)).toMatch('сокровище');
    });
});
