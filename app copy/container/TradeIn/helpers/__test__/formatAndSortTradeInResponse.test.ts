import formatAndSortTradeInResponse from '../formatAndSortTradeInResponse';

const tradeInDevicesApiResponse = require('../../../../../fixtures/api/tradeIn/iphone.json');

describe('formatAndSortTradeInResponse', () => {
    it('should format and sort response data', () => {
        expect(formatAndSortTradeInResponse(tradeInDevicesApiResponse)[0]).toEqual({ id: 'r:150874', text: 'iPhone 13 128GB' });
    });
});
