import { ExperimentsResolver } from './ExperimentsResolver';

describe('ExperimentsResolver', () => {
    test('resolve', async () => {
        const resolver = new ExperimentsResolver();

        expect(resolver.resolve('1FFFF')).toEqual(['cities']);
        expect(resolver.resolve('F1FFF')).toEqual(['things']);
    });
});
