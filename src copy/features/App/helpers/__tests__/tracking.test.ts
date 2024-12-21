import {
    createPageViewTrackingData,
    createTrackingData,
    getTradeInTrackingPayload,
} from '../tracking';
import { SelectorReturnType } from '@vfde-sails/core';
import { selectTrackingPayload } from '../../selectors';
import {
    ADDITIONAL_PAGE_OPTIONS,
    GIGAKOMBI_IP,
    RED_M_VIRTUAL_ID,
    SAILS_PAGE_OPTIONS,
    SALESCHANNEL_CONSUMER,
} from '@vfde-sails/constants';
import { AdditionalPageOptions } from '../../interfaces/additionalPageOptions';
import {
    TrackingBtx,
    TRACKING_PLATFORM_TYPE_RESPONSIVE,
    TRACKING_PRODUCT_LINE,
    TRACKING_PRODUCT_TYPE,
    TRACKING_SITE_AREA_MOBILITY,
    TrackingProductType,
    TrackingFlowType,
    TrackingPageType,
    TrackType,
    TRACKING_FLOWTYPE_STORAGE,
    trackIt,
    TrackingError,
    TrackingErrorType,
    TrackToggleOption,
    TRACKING_INFORMATION_ACTION_REVEAL,
    TrackingInformationUiType,
    TrackingInformationTrigger,
    addTrackingToAction,
} from '@vfde-sails/tracking';
import {
    getSessionStorageItemJson,
    setSessionStorageItemJson,
} from '@vfde-sails/storage';
import {
    geFlowTypeStorage,
    trackError,
    trackOverlayReveal,
} from '../tracking';
import { PriceType } from '@vfde-sails/glados-v2';
import type { Device } from '../../../TradeIn/interfaces/api';
import { RootState } from '../../../../app/store';
import appSlice from '../../slice';
import optionsSlice from '../../../Options/slice';
import tariffSlice from '../../../Tariff/slice';
import { configureStore } from '@reduxjs/toolkit';
const { sailsPageOptions } = require('@vfde-sails/page-options/fixtures');

const createStoreForTest = (preloadedState: RootState) => configureStore({
    reducer: state => state,
    preloadedState,
});

jest.mock<typeof import('@vfde-sails/tracking')>('@vfde-sails/tracking', () => ({
    ...jest.requireActual('@vfde-sails/tracking'),
    trackIt: jest.fn(),
    getSiteStructure: jest.fn().mockReturnValue(['foo', 'bar']),
    getLoginData: jest.fn().mockReturnValue(false),
    getCustomerFlow: jest.fn().mockReturnValue('customer flow'),
    getFlowType: jest.fn().mockReturnValue('foo'),
    addTrackingToAction: jest.fn(),
}));

jest.mock('@vfde-sails/storage', () => ({
    setSessionStorageItemJson: jest.fn(),
    getSessionStorageItemJson: jest.fn(),
}));

// eslint-disable-next-line max-len
jest.mock<typeof import('../../../../helpers/getUserDataHelper')>('../../../../helpers/getUserDataHelper', () => ({
    ...jest.requireActual('../../../../helpers/getUserDataHelper'),
    getIsWinbackCustomer: jest.fn().mockReturnValue(false),
}));

jest.mock('@vfde-brix/ws10/styles', () => ({
    CLASSNAME_HIDDEN: 'ws10-hidden',
}));

jest.mock('@vfde-brix/ws10/option-picker', () => ({
    OPTION_PICKER_INPUT_CLASSNAME: 'ws10-option-picker__input',
}));

describe('Tracking helper', () => {
    describe('createTrackingPageView', () => {
        const atomicDevice = {
            label: 'Iphone',
            hardwareOnlyPrice: {
                [PriceType.Onetime]: {
                    gross: 1199,
                },
            },
            hardwareWithTariffPrice: {
                [PriceType.Onetime]: {
                    gross: 1,
                },
            },
            backendId: '123',
        };

        beforeEach(() => {
            window[ADDITIONAL_PAGE_OPTIONS] = {
                pageName: 'foo',
            } as AdditionalPageOptions;
        });

        afterAll(() => {
            window[ADDITIONAL_PAGE_OPTIONS] = {} as AdditionalPageOptions;
        });

        it('should return null when there is no atomic', () => {
            expect(createPageViewTrackingData({} as SelectorReturnType<typeof selectTrackingPayload>)).toBeNull();
        });

        it('should create tracking object for page view', () => {
            expect(createPageViewTrackingData({
                salesChannel: SALESCHANNEL_CONSUMER,
                subscriptionId: RED_M_VIRTUAL_ID,
                activeOffer: {
                    prices: {
                        composition: {
                            hardware: {
                                onetime: {
                                    withoutDiscounts: {
                                        gross: 49.99,
                                    },
                                },
                            },
                        },
                    },
                    tariffName: 'Red M',
                },
                priceToPay: {
                    gross: 21.99,
                },
                atomicDevice,
            } as unknown as SelectorReturnType<typeof selectTrackingPayload>)).toEqual(expect.objectContaining({
                /* eslint-disable jsdoc/require-jsdoc, @typescript-eslint/naming-convention, camelcase */
                flow_type: TrackingFlowType.VvlProductDetails,
                is_winback_customer: false,
                page_type: TrackingPageType.ProductDetail,
                site_area: TRACKING_SITE_AREA_MOBILITY,
                login_status: 'not logged in',
                line_of_customer: 'customer flow',
                platform_type: TRACKING_PLATFORM_TYPE_RESPONSIVE,
                business_transaction_type: TrackingBtx.Vvl,
                /* eslint-enable jsdoc/require-jsdoc, @typescript-eslint/naming-convention, camelcase */
                oOrder: expect.objectContaining({
                    aProducts: expect.arrayContaining([
                        expect.objectContaining({
                            name: 'Iphone',
                            priceOnce: '49.99',
                            sku: '123',
                            type: TrackingProductType.Device,
                        }),
                        expect.objectContaining({
                            name: 'Red M',
                            priceMonthly: '21.99',
                            priceOnce: '49.99',
                            sku: '135',
                            type: 'tariff',
                        }),
                    ]),
                    aPropositions: expect.arrayContaining([
                        expect.objectContaining({
                            name: 'Iphone | Red M',
                            productCategory: TrackingProductType.Bundle,
                            retention: TrackingBtx.Vvl,
                            productType: TRACKING_PRODUCT_TYPE,
                            productLine: TRACKING_PRODUCT_LINE,
                        }),
                    ]),
                }),
            }));
        });
    });

    describe('geFlowTypeStorage', () => {

        it('should get flowType from session storage', () => {
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => TrackingFlowType.VvlProductDetails);

            expect(geFlowTypeStorage()).toBe(TrackingFlowType.VvlProductDetails);
        });

        it('should return vvl device flowType and set it in the storage', () => {
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => undefined);

            expect(setSessionStorageItemJson(TRACKING_FLOWTYPE_STORAGE, TrackingFlowType.VvlProductDetails)).toBeCalled;
            expect(geFlowTypeStorage()).toBe(TrackingFlowType.VvlProductDetails);
        });
    });

    describe('trackOverlayReveal', () => {
        it('should track', () => {
            (<jest.Mock>trackIt).mockImplementation(() => undefined);
            trackOverlayReveal();

            expect((<jest.Mock>trackIt)).toHaveBeenCalledTimes(1);
            expect((<jest.Mock>trackIt)).toHaveBeenCalledWith(
                TrackType.Information,
                /* eslint-disable camelcase */
                {
                    information_action: 'reveal',
                    information_name: 'produktdetails',
                    information_ui_type: TrackingInformationUiType.Overlay,
                    information_trigger: TrackingInformationTrigger.Anchor,
                },
            );
        });
    });

    describe('trackError', () => {
        it('should track error', () => {
            (<jest.Mock>trackIt).mockImplementation(() => undefined);
            const trackingError: TrackingError = {
                type: TrackingErrorType.Technical,
                message: 'Not found',
                code: '404',
                location: 'api',
            };

            trackError(trackingError);

            expect(trackIt).toHaveBeenCalledTimes(1);
            expect(trackIt).toHaveBeenCalledWith(TrackType.Error, trackingError);
        });
    });

    describe('getTradeInTrackingPayload', () => {
        it('should create object for trade in reveal', () => {
            expect(getTradeInTrackingPayload(true, null)).toEqual({
                trackingType: TrackType.Information,
                trackingPayload: expect.objectContaining({
                    /* eslint-disable @typescript-eslint/naming-convention, camelcase */
                    information_action: TRACKING_INFORMATION_ACTION_REVEAL,
                    information_name: 'trade-in option',
                    /* eslint-enable @typescript-eslint/naming-convention, camelcase */
                }),
            });
        });

        describe('should create object for trade in switch', () => {
            beforeEach(() => {
                window[SAILS_PAGE_OPTIONS] = sailsPageOptions;
            });

            it('select', () => {
                expect(getTradeInTrackingPayload(true, {
                    name: 'Iphone',
                    formattedPrice: '199.99',
                } as Device)).toEqual({
                    trackingType: TrackType.SwitchOptions,
                    trackingPayload: {
                        [TrackToggleOption
                            .Selected]: [expect.objectContaining({
                            sku: '2710',
                            name: 'trade in Iphone',
                            priceOnce: '199.99',
                            priceMonthly: '15.00',
                        })],
                    },
                });
            });

            it('remove', () => {
                expect(getTradeInTrackingPayload(false, {
                    name: 'Iphone',
                    formattedPrice: '199.99',
                } as Device)).toEqual({
                    trackingType: TrackType.SwitchOptions,
                    trackingPayload: {
                        [TrackToggleOption.Removed]: [expect.objectContaining({
                            sku: '2710',
                            name: 'trade in Iphone',
                            priceOnce: '199.99',
                            priceMonthly: '15.00',
                        })],
                    },
                });
            });
        });
    });
    describe('createTrackingData', () => {
        it('should track data', () => {
            const store = createStoreForTest({
                [appSlice.reducerPath]: {
                    salesChannel: SALESCHANNEL_CONSUMER,
                    deviceId: '123',
                    gigakombiType: GIGAKOMBI_IP,
                    isGigakombiEligible: true,
                    isTradeIn: true,
                    isTauschbonus: false,
                },
                [optionsSlice.reducerPath]: {
                    atomicId: '333',
                },
                [tariffSlice.reducerPath]: {
                    promotionalSummaryCardOffer: { offerPrice: 8 },
                },
            } as RootState);
            createTrackingData(store.getState());
            expect(addTrackingToAction).toHaveBeenCalled();
        });
    });
});
