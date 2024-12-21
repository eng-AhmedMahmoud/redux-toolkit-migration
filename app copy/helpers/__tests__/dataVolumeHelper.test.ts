import formatDataVolume from '../dataVolumeHelper';

describe('formatDataVolume', () => {
    it('should format a simple number with a decimal', () => {
        const numberStr = '7.5';
        const expectedResult = '7,5';
        const formattedNumber = formatDataVolume(numberStr);
        expect(formattedNumber).toBe(expectedResult);
    });

    it('should format a number with leading zeros', () => {
        const numberStr = '0.01';
        const expectedResult = '0,01';
        const formattedNumber = formatDataVolume(numberStr);
        expect(formattedNumber).toBe(expectedResult);
    });

    it('should format a number with trailing zeros', () => {
        const numberStr = '10.00';
        const expectedResult = '10,00';
        const formattedNumber = formatDataVolume(numberStr);
        expect(formattedNumber).toBe(expectedResult);
    });

    it('should handle a string without a decimal', () => {
        const numberStr = '100';
        const expectedResult = '100'; // No change
        const formattedNumber = formatDataVolume(numberStr);
        expect(formattedNumber).toBe(expectedResult);
    });

    it('should handle an empty string', () => {
        const numberStr = '';
        const expectedResult = ''; // No change
        const formattedNumber = formatDataVolume(numberStr);
        expect(formattedNumber).toBe(expectedResult);
    });
});
