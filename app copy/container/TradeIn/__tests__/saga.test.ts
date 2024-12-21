import {
    call,
    put,
    takeLatest,
} from 'redux-saga/effects';
import tradeInSaga, {
    deleteSelectedTradeInDeviceSaga,
    getTradeInDevicesSaga,
    handleSetTradeInSaga,
    selectTradeInDeviceSaga,
    setIsTradeInSelectedSaga,
} from '../saga';
import {
    deleteSelectedTradeInDevice,
    getTradeInDevices,
    getTradeInDevicesFailed,
    getTradeInDevicesSuccess,
    setIsTradeInSelected,
    setSelectedTradeInDeviceId,
} from '../slice';
import { setIsTradeIn } from '../../App/slice';
import type {
    ApiDevice,
    ApiResponse,
    Device,
} from '../interfaces/api';
import { trackIt } from '@vfde-sails/tracking';
import {
    SAILS_PARAM_TRADE_IN_DEVICE,
    TRADEIN_INPUT_MAX_LENGTH,
    TRADEIN_INPUT_MIN_LENGTH,
    TRADE_IN_API_QUERY_PARAM,
} from '../constants';
import {
    getApiConfig,
    requestJson,
    sanitizeInput,
} from '@vfde-sails/utils';
import { filterAndFormatDevices } from '../helpers/filterAndFormatDevices';
import {
    SailsVvlStorage,
    getSessionStorageItemJson,
    updateStorage,
} from '@vfde-sails/storage';
import { SailsDeviceDetailsStorage } from '../../../../app/container/App/interfaces/storage';
import {
    ADDITIONAL_PAGE_OPTIONS,
    SAILS_PARAM_TAUSCHBONUS,
    SAILS_PARAM_TRADE_IN,
    SAILS_VVL_STORAGE,
} from '@vfde-sails/constants';
import type { AdditionalPageOptions } from '../../../container/App/interfaces/additionalPageOptions';
import { getSubscriptions } from 'Container/Tariff/slice';
import { selectIsTauschbonusEligible } from 'Container/App/selectors';

jest.mock('@vfde-sails/utils', () => ({
    ...jest.requireActual('@vfde-sails/utils'),
    __esModule: true, // eslint-disable-line @typescript-eslint/naming-convention
    getApiConfig: jest.fn().mockImplementation(() => ({
        key: 'djc0a0pjbDBUQVFaZjc3OVNPbzJZQnA4Z1IzaXZaV0M6U1lBdlVjbjlmVllPRzQ2dw==',
        url: 'https://eu2.api.vodafone.com/tmf-api/productCatalogManagement/v4/productOffering',
    })),
}));
describe('TradeIn Sagas', () => {
    beforeEach(() => {
        window[ADDITIONAL_PAGE_OPTIONS] = {
            promos: {
                tauschbonus: {
                    tauschbonusSubline: 'test tauschbonus',
                },
            },
        } as AdditionalPageOptions;
    });

    describe('tradeInSaga', () => {
        const generator = tradeInSaga();

        it('should start watch tasks in the correct order', () => {
            expect(generator.next().value).toEqual(takeLatest(setIsTradeInSelected.type, setIsTradeInSelectedSaga));
            expect(generator.next().value).toEqual(takeLatest(getTradeInDevices.type, getTradeInDevicesSaga));
            expect(generator.next().value).toEqual(takeLatest(setSelectedTradeInDeviceId.type, selectTradeInDeviceSaga));
            expect(generator.next().value).toEqual(takeLatest(deleteSelectedTradeInDevice.type, deleteSelectedTradeInDeviceSaga));
            expect(generator.next().value).toEqual(takeLatest(setIsTradeIn.type, handleSetTradeInSaga));
            expect(generator.next().done).toBe(true);
        });
    });

    describe('setIsTradeInSelectedSaga', () => {
        let generator: Generator;

        beforeEach(() => {
            generator = setIsTradeInSelectedSaga();
        });

        it('updates the storage and tracks when tradein is enabled', () => {
            const isTradeInSelected = true;
            const isTradeIn = true;
            const selectedTradeInDeviceId = '123';
            const selectedTradeInDevice = {
                id: selectedTradeInDeviceId,
                name: 'foo',
                formattedPrice: 'bar',
            } as Device;

            generator.next();
            generator.next([isTradeInSelected, isTradeIn, selectedTradeInDevice]);

            expect(generator.next({ trackingType: 'foo', trackingPayload: { bar: 'foo' } }).value)
                .toEqual(put(setIsTradeIn(true)));
            expect(generator.next().value).toEqual(call(trackIt, 'foo', { bar: 'foo' }));
            expect(generator.next().done).toBe(true);
        });

        describe('when isTradeInSelected is disabled', () => {
            beforeEach(() => {
                window[ADDITIONAL_PAGE_OPTIONS] = {
                    promos: {},
                } as AdditionalPageOptions;
            });

            it('updates the storage and tracks when isTradeInSelected is disabled', () => {
                const isTradeInSelected = false;
                const isTradeIn = false;
                const selectedTradeInDevice = null;

                generator.next();
                generator.next([isTradeInSelected, isTradeIn, selectedTradeInDevice]);

                expect(generator.next({ trackingType: 'foo', trackingPayload: { bar: 'foo' } }).value)
                    .toEqual(put(setIsTradeIn(false)));
                expect(generator.next().value).toEqual(call(trackIt, 'foo', { bar: 'foo' }));
                expect(generator.next().value).toEqual(put(getTradeInDevicesSuccess(selectedTradeInDevice ? [selectedTradeInDevice] : null)));
                expect(generator.next().done).toBe(true);
            });
        });
    });

    describe('getTradeInDevicesSaga', () => {
        const optionsFixture = {
            method: 'GET',
            headers: {
                'Authorization': 'Basic djc0a0pjbDBUQVFaZjc3OVNPbzJZQnA4Z1IzaXZaV0M6U1lBdlVjbjlmVllPRzQ2dw==', // eslint-disable-line @typescript-eslint/naming-convention
                'Content-Type': 'application/json',
                'vf-country-code': 'DE',
                'vf-project': 'DLS',
            },
        };
        let generator: Generator;

        beforeEach(() => {
            generator = getTradeInDevicesSaga();
        });

        it('should handle too short input values', () => {
            const suggestInputValue = 'i'.repeat(TRADEIN_INPUT_MIN_LENGTH - 1);

            generator.next(); // selectTradeInInputValue
            expect(generator.next(suggestInputValue).value).toEqual(call(sanitizeInput, suggestInputValue));
            expect(generator.next(suggestInputValue).value).toEqual(put(getTradeInDevicesSuccess(null)));
            expect(generator.next().done).toBe(true);
        });

        it('should handle too long input values', () => {
            const suggestInputValue = 'i'.repeat(TRADEIN_INPUT_MAX_LENGTH + 1);

            generator.next();
            expect(generator.next(suggestInputValue).value).toEqual(call(sanitizeInput, suggestInputValue));
            expect(generator.next(suggestInputValue).value).toEqual(put(getTradeInDevicesSuccess([])));
            expect(generator.next().done).toBe(true);
        });

        it('should handle successful response', () => {
            const suggestInputValue = 'iphone';
            const urlFixture = `https://eu2.api.vodafone.com/tmf-api/productCatalogManagement/v4/productOffering?${TRADE_IN_API_QUERY_PARAM}=${suggestInputValue}`;

            generator.next();
            generator.next(suggestInputValue); // provide suggestInputValue

            expect(generator.next(suggestInputValue).value).toEqual(call(requestJson, urlFixture, optionsFixture));
            expect(getApiConfig).toHaveBeenCalled();

            const responseFixture: ApiResponse<ApiDevice[]> = {
                status: 200,
                statusText: 'OK',
                headers: new Headers(),
                body: [
                    {
                        name: 'iPhone 8 64GB',
                        id: 'r:148840',
                        prodSpecCharValueUse: [
                            {
                                name: 'brand',
                                value: 'Apple',
                            },
                        ],
                        productOfferingPrice: [
                            {
                                priceType: 'max',
                                price: {
                                    value: 70,
                                    unit: 'EUR',
                                },
                            },
                        ],
                        attachment: [
                            {
                                url: 'https://d1sqcuczy37e01.cloudfront.net/mobiles_MD/148840db1b2.jpg',
                                name: 'imageMD',
                            },
                        ],
                    },
                ],
            };

            expect(generator.next(responseFixture).value).toEqual(call(filterAndFormatDevices, responseFixture.body));

            const filteredAndFormattedDevices = filterAndFormatDevices(responseFixture.body);
            expect(generator.next(filteredAndFormattedDevices).value).toEqual(put(getTradeInDevicesSuccess(filteredAndFormattedDevices)));
            expect(generator.next().done).toBe(true);
        });

        it('should catch exceptions', () => {
            const suggestInputValue = 'iphone';
            const urlFixture = `https://eu2.api.vodafone.com/tmf-api/productCatalogManagement/v4/productOffering?${TRADE_IN_API_QUERY_PARAM}=${suggestInputValue}`;

            generator.next();
            generator.next(suggestInputValue); // provide suggestInputValue

            expect(generator.next(suggestInputValue).value).toEqual(call(requestJson, urlFixture, optionsFixture));
            expect(generator.throw(new Error('Some error')).value).toEqual(put(getTradeInDevicesFailed()));
            expect(generator.next().done).toBe(true);
        });
    });

    describe('selectTradeInDeviceSaga', () => {
        let generator: Generator;

        beforeEach(() => {
            generator = selectTradeInDeviceSaga();
        });

        it('works with devices', () => {
            const selectedTradeInDevice: Partial<Device> = { id: '2', name: 'foo', formattedPrice: 'bar' };

            generator.next();
            generator.next(selectedTradeInDevice);
            generator.next(selectIsTauschbonusEligible);

            expect(generator.next({ trackingType: 'foo', trackingPayload: { bar: 'foo' } }).value)
                .toEqual(put((setIsTradeIn(true))));

            expect(generator.next().value).toEqual(call(trackIt, 'foo', { bar: 'foo' }));

            expect(generator.next().value).toEqual(call(updateStorage<SailsDeviceDetailsStorage>, SAILS_VVL_STORAGE, {
                [SAILS_PARAM_TRADE_IN]: true,
                [SAILS_PARAM_TAUSCHBONUS]: true,
                [SAILS_PARAM_TRADE_IN_DEVICE]: selectedTradeInDevice as Device,
            },
            getSessionStorageItemJson(SAILS_VVL_STORAGE),
            { shouldDeepMerge: false }));

            expect(generator.next().done).toBe(true);
        });

        it('works without devices', () => {
            generator.next();
            generator.next(null);
            generator.next(false);
            expect(generator.next({ trackingType: 'foo', trackingPayload: { bar: 'foo' } }).value)
                .toEqual(put(setIsTradeIn(false)));

            expect(generator.next().done).toBe(true);
        });
    });

    describe('deleteSelectedTradeInDeviceSaga', () => {
        let generator: Generator;

        beforeEach(() => {
            generator = deleteSelectedTradeInDeviceSaga();
        });

        it('deletes selected device and tracks deletion', () => {
            expect(generator.next().value).toEqual(put(setIsTradeIn(false)));

            generator.next();
            const mockTrackingPayload = { trackingType: 'foo', trackingPayload: { bar: 'foo' } };
            expect(generator.next(mockTrackingPayload).value).toEqual(call(trackIt, 'foo', { bar: 'foo' }));

            expect(generator.next().value).toEqual(
                call(updateStorage<SailsVvlStorage | SailsDeviceDetailsStorage>, SAILS_VVL_STORAGE, {
                    [SAILS_PARAM_TRADE_IN]: false,
                    [SAILS_PARAM_TAUSCHBONUS]: false,
                    [SAILS_PARAM_TRADE_IN_DEVICE]: null,
                }, getSessionStorageItemJson(SAILS_VVL_STORAGE), { shouldDeepMerge: false }),
            ); // Update storage with trade-in set to false and trade-in device set to null

            expect(generator.next().done).toBe(true);
        });
    });

    describe('handleSetTradeInSaga', () => {
        let generator: Generator;

        beforeEach(() => {
            generator = handleSetTradeInSaga();
        });

        it('should dispatch getSubscription action', () => {
            const isTauschbonusEligible = true;
            const subscriptionId = 'foo';

            generator.next();
            expect(generator.next([subscriptionId, isTauschbonusEligible]).value)
                .toEqual(put(getSubscriptions()));
            expect(generator.next().done).toBe(true);
        });

        describe('should not dispatch getSubscripotion action', () => {
            beforeEach(() => {
                window[ADDITIONAL_PAGE_OPTIONS] = {
                    promos: {},
                } as AdditionalPageOptions;
            });

            it('when user has no subscription', () => {
                const isTauschbonusEligible = true;
                const subscriptionId = null;

                generator.next();
                expect(generator.next([subscriptionId, isTauschbonusEligible]).done)
                    .toBe(true);
            });

            it('when device is not tauschbonus eligible', () => {
                const isTauschbonusEligible = false;
                const subscriptionId = 'foo';

                generator.next();
                expect(generator.next([subscriptionId, isTauschbonusEligible]).done)
                    .toBe(true);
            });
        });
    });
});
