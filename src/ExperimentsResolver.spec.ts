import { ExperimentsResolver } from './ExperimentsResolver';

describe('ExperimentsResolver', () => {
    test('resolve', async () => {
        const resolver = new ExperimentsResolver();

        expect(resolver.resolve('0')).toEqual(['Cities']);
        expect(resolver.resolve('3')).toEqual(['Cities']);

        expect(resolver.resolve('4')).toEqual(['Things']);
        expect(resolver.resolve('7')).toEqual(['Things']);

        expect(resolver.resolve('8')).toEqual(['Rhymes']);
        expect(resolver.resolve('b')).toEqual(['Rhymes']);
    });
});
