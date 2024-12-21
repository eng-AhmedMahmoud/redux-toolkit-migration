import {
    ADDITIONAL_PAGE_OPTIONS,
    SAILS_PARAM_TRADE_IN,
} from '@vfde-sails/constants';
import { getSessionStorageItemJson } from '@vfde-sails/storage';
import {
    getIsTradeIn,
    getTradeInDeviceFromStorage,
    getTradeInSuggestInputNotificationContent,
} from '../getTradeInHelpers';
import { SAILS_PARAM_TRADE_IN_DEVICE } from '../../features/TradeIn/constants';
import { RootState } from 'src/app/store';
import {
    selectHasError,
    selectIsDeviceNotFound,
} from '../../features/TradeIn/selectors';

jest.mock('@vfde-sails/storage', () => ({
    getSessionStorageItemJson: jest.fn().mockImplementation(() => null),
}));

jest.mock('../../features/TradeIn/selectors', () => ({
    selectHasError: jest.fn(),
    selectIsDeviceNotFound: jest.fn(),
}));

describe('getTradeInHelpers', () => {
    describe('getIsTradeIn', () => {
        it('should return true if tradeIn is enabled in storage', () => {
            (getSessionStorageItemJson as jest.Mock).mockReturnValue({
                [SAILS_PARAM_TRADE_IN]: true,
            });

            const isTradeIn = getIsTradeIn();

            expect(isTradeIn).toEqual(true);
        });

        it('should return false if tradeIn is not set in storage', () => {
            (getSessionStorageItemJson as jest.Mock).mockReturnValue({
                [SAILS_PARAM_TRADE_IN]: false,
            });

            const isTradeIn = getIsTradeIn();

            expect(isTradeIn).toEqual(false);
        });

        it('should return false if storage is empty', () => {
            (getSessionStorageItemJson as jest.Mock).mockReturnValue(null);

            const isTradeIn = getIsTradeIn();

            expect(isTradeIn).toEqual(false);
        });

        it('should return false if storage is undefined', () => {
            (getSessionStorageItemJson as jest.Mock).mockReturnValue(undefined);

            const isTradeIn = getIsTradeIn();

            expect(isTradeIn).toEqual(false);
        });

        afterEach(() => {
            (getSessionStorageItemJson as jest.Mock).mockClear();
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

        it('should return the tradeIn device from storage', () => {
            (getSessionStorageItemJson as jest.Mock).mockReturnValue({
                [SAILS_PARAM_TRADE_IN_DEVICE]: tradeInDeviceModel,
            });

            const tradeInDeviceFromStorage = getTradeInDeviceFromStorage();

            expect(tradeInDeviceFromStorage).toEqual(tradeInDeviceModel);
        });

        it('should return null if no tradeIn device is found in storage', () => {
            (getSessionStorageItemJson as jest.Mock).mockReturnValue(null);

            const tradeInDeviceFromStorage = getTradeInDeviceFromStorage();

            expect(tradeInDeviceFromStorage).toBeNull();
        });

        it('should return null if storage is undefined', () => {
            (getSessionStorageItemJson as jest.Mock).mockReturnValue(undefined);

            const tradeInDeviceFromStorage = getTradeInDeviceFromStorage();

            expect(tradeInDeviceFromStorage).toBeNull();
        });

        afterEach(() => {
            (getSessionStorageItemJson as jest.Mock).mockClear();
        });
    });

    describe('getTradeInSuggestInputNotificationContent', () => {
        const mockState = {} as RootState;

        beforeEach(() => {
            (window as any)[ADDITIONAL_PAGE_OPTIONS] = {
                promos: {
                    tradeIn: {
                        suggestInputLabel: 'Tipp hier Dein Modell ein',
                        suggestInputPlaceholder: 'Tipp hier Dein Smartphone-Modell ein',
                        deviceNotFoundText: 'Wir konnten das Modell leider nicht finden.',
                        technicalErrorText: 'Technischer Fehler: Bitte versuch es später nochmal!',
                        itemSummaryCardSubline: ' ',
                    },
                },
            };
        });

        it('should return error notification properties when there is an error', () => {
            (selectHasError as unknown as jest.Mock).mockReturnValue(true);
            (selectIsDeviceNotFound as unknown as jest.Mock).mockReturnValue(false);

            const result = getTradeInSuggestInputNotificationContent(mockState);

            expect(result).toEqual({
                optState: 'error',
                txtContent: window[ADDITIONAL_PAGE_OPTIONS]?.promos?.tradeIn?.technicalErrorText,
            });
        });

        it('should return device not found notification properties when device is not found', () => {
            (selectHasError as unknown as jest.Mock).mockReturnValue(false);
            (selectIsDeviceNotFound as unknown as jest.Mock).mockReturnValue(true);

            const result = getTradeInSuggestInputNotificationContent(mockState);

            expect(result).toEqual({
                optState: 'info',
                txtContent: window[ADDITIONAL_PAGE_OPTIONS]?.promos?.tradeIn?.deviceNotFoundText,
            });
        });

        it('should return empty properties when there is no error and device is found', () => {
            (selectHasError as unknown as jest.Mock).mockReturnValue(false);
            (selectIsDeviceNotFound as unknown as jest.Mock).mockReturnValue(false);

            const result = getTradeInSuggestInputNotificationContent(mockState);

            expect(result).toEqual({});
        });

        it('should return empty properties when promos object is missing', () => {
            (window as any)[ADDITIONAL_PAGE_OPTIONS] = {};

            (selectHasError as unknown as jest.Mock).mockReturnValue(false);
            (selectIsDeviceNotFound as unknown as jest.Mock).mockReturnValue(false);

            const result = getTradeInSuggestInputNotificationContent(mockState);

            expect(result).toEqual({});
        });

        it('should return empty properties when technicalErrorText is missing', () => {
            (window as any)[ADDITIONAL_PAGE_OPTIONS] = {
                promos: { tradeIn: { deviceNotFoundText: 'Device not found' } },
            };

            (selectHasError as unknown as jest.Mock).mockReturnValue(true);
            (selectIsDeviceNotFound as unknown as jest.Mock).mockReturnValue(false);

            const result = getTradeInSuggestInputNotificationContent(mockState);

            expect(result).toEqual({
                optState: 'error',
                txtContent: '',
            });
        });

        it('should return empty properties when deviceNotFoundText is missing', () => {
            (window as any)[ADDITIONAL_PAGE_OPTIONS] = {
                promos: { tradeIn: { technicalErrorText: 'Error occurred' } },
            };

            (selectHasError as unknown as jest.Mock).mockReturnValue(false);
            (selectIsDeviceNotFound as unknown as jest.Mock).mockReturnValue(true);

            const result = getTradeInSuggestInputNotificationContent(mockState);

            expect(result).toEqual({
                optState: 'info',
                txtContent: '',
            });
        });

        afterEach(() => {
            (selectHasError as unknown as jest.Mock).mockClear();
            (selectIsDeviceNotFound as unknown as jest.Mock).mockClear();
        });
    });
});
