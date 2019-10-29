import { stemmer } from './stemmer';

describe('Stemmer', () => {
    test('Работает', async () => {
        expect(await stemmer('привет')).toEqual([
            {
                lexemes: [
                    {
                        gr: ['S', 'муж', 'неод', 'вин', 'ед'],
                        grs: [['S', 'муж', 'неод', 'вин', 'ед'], ['S', 'муж', 'неод', 'им', 'ед']],
                        lex: 'привет',
                        position: 0,
                        text: 'привет',
                    },
                    {
                        gr: ['S', 'муж', 'неод', 'им', 'ед'],
                        grs: [['S', 'муж', 'неод', 'вин', 'ед'], ['S', 'муж', 'неод', 'им', 'ед']],
                        lex: 'привет',
                        position: 0,
                        text: 'привет',
                    },
                ],
                text: 'привет',
            },
        ]);
    });
});
