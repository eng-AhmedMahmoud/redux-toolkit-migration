import replaceCMSPlaceholder from 'Helper/replaceCMSPlaceholder';

describe('replaceCMSPlaceholder', () => {
    it('sit replaced', () => {
        const str = 'Lorem {{ foo }}';
        const onj = {
            foo: 'Ipsum',
        };

        expect(replaceCMSPlaceholder(str, onj)).toBe('Lorem Ipsum');
    });

    it('sit replaced', () => {
        const str = 'Lorem {{ foo }}';
        const onj = {
            bar: 'Ipsum',
        };

        expect(replaceCMSPlaceholder(str, onj)).toBe(str);
    });

});
