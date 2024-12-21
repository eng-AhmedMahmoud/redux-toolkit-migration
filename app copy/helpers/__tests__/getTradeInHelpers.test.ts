import {
    ADDITIONAL_PAGE_OPTIONS,
    SAILS_PARAM_TRADE_IN,
    SAILS_VVL_STORAGE,
} from '@vfde-sails/constants';
import { getSessionStorageItemJson } from '@vfde-sails/storage';
import {
    getIsTradeIn,
    getTradeInDeviceFromStorage,
    getTradeInSuggestInputNotificationContent,
} from 'Helper/getTradeInHelpers';
import { SAILS_PARAM_TRADE_IN_DEVICE } from '../../container/TradeIn/constants';
import { AdditionalPageOptions } from 'Container/App/interfaces/additionalPageOptions';

jest.mock('@vfde-sails/storage', () => ({
    getSessionStorageItemJson: jest.fn().mockImplementation(() => null),
}));

describe('getTradeInHelpers', () => {
    it('should get isTradeIn from SailsVvlStorage', () => {
        (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => ({
            [SAILS_PARAM_TRADE_IN]: true,
        }));

        const isTradeIn = getIsTradeIn();

        expect(isTradeIn).toEqual(true);
    });
    afterEach(() => {
        sessionStorage.removeItem(SAILS_VVL_STORAGE);
        (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => null);
    });
});
describe('getTradeInDeviceFromStorage', () => {
    const tradeInDeviceModel = {
        formattedPrice: '434 €',
        id: 'r:150874',
        imgSrc: 'https://d1sqcuczy37e01.cloudfront.net/mobiles_MD/1508742855a.jpg',
        maxPrice: 434,
        name: 'iPhone 13 128GB',
    };
    it('should get tradeIn device from Session Storage', () => {
        (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => ({
            [SAILS_PARAM_TRADE_IN_DEVICE]: tradeInDeviceModel,
        }));

        const tradeInDeviceFromStorage = getTradeInDeviceFromStorage();

        expect(tradeInDeviceFromStorage).toEqual(tradeInDeviceModel);
    });
    afterEach(() => {
        sessionStorage.removeItem(SAILS_VVL_STORAGE);
        (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => null);
    });

    describe('getIsTradeIn', () => {
        it('should return false if no tradeIn in storage', () => {
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => null);
            const isTradeIn = getIsTradeIn();
            expect(isTradeIn).toEqual(false);
        });

        it('should get tradeIn from storage', () => {
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => ({
                [SAILS_PARAM_TRADE_IN]: true,
            }));

            const isTradeIn = getIsTradeIn();
            expect(isTradeIn).toEqual(true);
        });
    });

    describe('getTradeInSuggestInputNotificationContent', () => {
        beforeEach(() => {
            (window[ADDITIONAL_PAGE_OPTIONS] as Partial<AdditionalPageOptions>) = {
                promos: {
                    tradeIn: {
                        suggestInputLabel: 'Tipp hier Dein Modell ein',
                        suggestInputPlaceholder: 'Tipp hier Dein Smartphone-Modell ein',
                        deviceNotFoundText: 'Wir konnten das Modell leider nicht finden.',
                        technicalErrorText: 'Technischer Fehler: Bitte versuch es später nochmal!',
                    },
                },
            };
        });
        it('should return the error content if the hasError property is true', () => {

            const stateValues: { hasError: boolean; isDeviceNotFound: boolean } =
                {
                    hasError: true,
                    isDeviceNotFound: true,
                };
            const tradeInNotificationContent =
                getTradeInSuggestInputNotificationContent(stateValues);

            expect(tradeInNotificationContent).toEqual({
                optState: 'error',
                txtContent: window[ADDITIONAL_PAGE_OPTIONS]?.promos?.tradeIn?.technicalErrorText,
            });
        });
        it('should return the no device found content if the hasError property is true', () => {
            const stateValue: { hasError: boolean; isDeviceNotFound: boolean } =
                {
                    hasError: false,
                    isDeviceNotFound: true,
                };

            const tradeInNotificationContent =
                getTradeInSuggestInputNotificationContent(stateValue);
            expect(tradeInNotificationContent).toEqual({
                optState: 'info',
                txtContent: window[ADDITIONAL_PAGE_OPTIONS]?.promos?.tradeIn?.deviceNotFoundText,
            });
        });
    });

});
