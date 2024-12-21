import {
    selectDeviceId,
    selectGigakombiType,
    selectHasError,
    selectIsGigakombiEligible,
    selectIsLoading,
    selectIsRedplusEligible,
    selectIsSimonlyEligible,
    selectIsTauschbonus,
    selectIsTauschbonusEligible,
    selectIsTradeIn,
    selectIsYoungEligible,
    selectSalesChannel,
    selectTrackingPayload,
} from '../selectors';
import tariffSlice from '../../Tariff/slice';
import optionsSlice from '../../Options/slice';
import appSlice from '../slice';
import { RootState } from '../../../app/store';
import { configureStore } from '@reduxjs/toolkit';
import {
    RED_M_VIRTUAL_ID,
    SALESCHANNEL_CONSUMER,
} from '@vfde-sails/constants';
import {
    getTariffWithHardware,
    gladosApi,
} from '../../../api/glados';
import { QueryStatus } from '@reduxjs/toolkit/query';

describe('VVL hardwareDetail Selectors', () => {
    const createStoreForTest = () => configureStore({ reducer: {
        [appSlice.reducerPath]: ()=> ({
            loading: {
                startVvlAuth: true,
            },
            salesChannel: SALESCHANNEL_CONSUMER,
            deviceId: '1234',
            isSimonlyEligible: true,
            isYoungEligible: true,
            isRedplusEligible: true,
            isTradeIn: true,
            isTauschbonus: true,
            isTauschbonusEligible: true,
            gigakombiType: 'tv',
            isGigakombiEligible: true,
        }),
        [tariffSlice.name]: ()=> ({
            subscriptionId: RED_M_VIRTUAL_ID,
        }),
        [optionsSlice.name]: () => ({
            errors: {
                getHardwareDetailGroup: false,
            },
            loading: {
                getHardwareDetailGroup: false,
            },
            atomicId: 'foo',
            devicePayload: {
                data: {
                    atomics: [
                        {
                            hardwareId: 'foo',
                        },
                    ],
                },
            },
        }),
        [gladosApi.reducerPath]: () => ({
            queries: {
                [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                    status: QueryStatus.rejected,
                },
            },
        }),
    } });

    const store = createStoreForTest();

    describe('selectIsLoading', () => {
        describe('should select the loading state', () => {
            it('should return true if some are loading', () => {

                expect(selectIsLoading(store.getState() as RootState)).toEqual(true);
            });
        });
    });

    describe('selectHasError', () => {
        describe('should select the error state', () => {
            it('should return true if some have error', () => {
                expect(selectHasError(store.getState() as RootState)).toEqual(true);
            });

        });
    });

    describe('selectSalesChannel', () => {
        it('should select the salesChannel state', () => {
            expect(selectSalesChannel(store.getState() as RootState)).toEqual(SALESCHANNEL_CONSUMER);
        });
    });

    describe('selectDeviceId', () => {
        it('should select the deviceId state', () => {
            expect(selectDeviceId(store.getState() as RootState)).toEqual('1234');
        });
    });

    describe('selectIsSimonlyEligible', () => {
        it('should select the isSimonlyEligible state', () => {
            expect(selectIsSimonlyEligible(store.getState() as RootState)).toEqual(true);
        });
    });

    describe('selectIsYoungEligible', () => {
        it('should select the isYoungEligible state', () => {
            expect(selectIsYoungEligible(store.getState() as RootState)).toEqual(true);
        });
    });

    describe('selectIsRedplusEligible', () => {
        it('should select the isRedplusEligible state', () => {
            expect(selectIsRedplusEligible(store.getState() as RootState)).toEqual(true);
        });
    });

    describe('selectIsTradeIn', () => {
        it('should select the isTradeIn state', () => {
            expect(selectIsTradeIn(store.getState() as RootState)).toEqual(true);
        });
    });

    describe('selectIsTauschbonus', () => {
        it('should select the isTauschbonus state', () => {
            expect(selectIsTauschbonus(store.getState() as RootState)).toEqual(true);
        });
    });

    describe('selectIsTauschbonusEligible', () => {
        it('should select the isTauschbonusEligible state', () => {
            expect(selectIsTauschbonusEligible(store.getState() as RootState)).toEqual(true);
        });
    });

    describe('selectGigakombiType', () => {
        it('should select the gigakombiType state', () => {
            expect(selectGigakombiType(store.getState() as RootState)).toEqual('tv');
        });
    });
    describe('selectIsGigakombiEligible', () => {
        it('should select the isGigakombiEligible flag', () => {
            expect(selectIsGigakombiEligible(store.getState() as RootState)).toEqual(true);
        });
    });

    describe('selectTrackingPayload', () => {
        it('should return tracking payload', () => {
            expect(selectTrackingPayload(store.getState() as RootState)).toEqual({
                salesChannel: SALESCHANNEL_CONSUMER,
                subscriptionId: RED_M_VIRTUAL_ID,
                activeOffer: null,
                atomicDevice: {
                    hardwareId: 'foo',
                },
                priceToPay: null,
            });
        });
    });
});
