import { tts } from './speech';

describe('Speech', () => {
    test('tts', () => {
        expect(tts`Смелость ${'- - -'} города берет.`.text).toEqual('Смелость города берет.');
        expect(tts`Смелость ${'- - -'} города берет.`.tts).toEqual('Смелость - - - города берет.');
    });
});
