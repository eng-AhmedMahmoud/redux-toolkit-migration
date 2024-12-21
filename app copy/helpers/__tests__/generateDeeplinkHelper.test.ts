import {
    GIGAKOMBI_IP,
    GIGAKOMBI_TV,
    RED_M_VIRTUAL_ID,
    SALESCHANNEL_CONSUMER,
} from '@vfde-sails/constants';
import { generateDeeplinkHelper } from 'Helper/generateDeeplinkHelper';
import { StrictEffect } from 'redux-saga/effects';

jest.mock('@vfde-sails/page-options', () => ({
    ...jest.requireActual('@vfde-sails/page-options'),
    __esModule: true,
    getDeviceDiscountSoc: jest.fn().mockImplementation(() => []),
    getDefaultDiscountSocs: jest.fn().mockImplementation(() => []),
}));

describe('generateDeeplinkHelper', () => {
    let generator: Generator<StrictEffect>;

    it('should generate a deeplink', () => {
        generator = generateDeeplinkHelper();
        generator.next();
        generator.next([SALESCHANNEL_CONSUMER, 1234, { id: 5678 }, '1234', GIGAKOMBI_TV, true]);
        generator.next([1, 2, 3]);
        const { value, done } = generator.next();

        expect(value).toContain('/shop/warenkorb.html');
        expect(done).toEqual(true);
    });

    it('should generate a deeplink with tauschbonus', () => {
        generator = generateDeeplinkHelper();
        generator.next();

        generator.next([
            {
                salesChannel: SALESCHANNEL_CONSUMER,
                deviceId: '123',
                subscriptionIds: [RED_M_VIRTUAL_ID],
                isGigakombi: true,
                gigakombiType: GIGAKOMBI_IP,
                isTradeIn: true,
                isTauschbonus: true,
                isRestlaufzeit: false,
            },
            {
                subLevelId: '123',
            },
        ]);

        generator.next([1, 2, 3]);
        const { value, done } = generator.next();

        expect(value).toEqual('/shop/warenkorb.html#/basket/eyJWVkwiOnsiSEFSRFdBUkVJRCI6eyJzdWJMZXZlbElkIjoiMTIzIn19fQ==');
        expect(done).toEqual(true);
    });
});
