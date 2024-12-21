import {
    ADDITIONAL_PAGE_OPTIONS,
    GIGAKOMBI_IP,
    RED_M_VIRTUAL_ID,
    SALESCHANNEL_CONSUMER,
} from '@vfde-sails/constants';
import { generateDeeplinkHelper } from '../generateDeeplinkHelper';
import { configureStore } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import appSlice from '../../features/App/slice';
import optionsSlice from '../../features/Options/slice';
import tariffSlice from '../../features/Tariff/slice';

jest.mock('@vfde-sails/page-options', () => ({
    ...jest.requireActual('@vfde-sails/page-options'),
    __esModule: true,
    getDeviceDiscountSoc: jest.fn().mockImplementation(() => []),
    getDefaultDiscountSocs: jest.fn().mockImplementation(() => []),
}));

const createStoreForTest = (preloadedState: RootState) => configureStore({
    reducer: state => state,
    preloadedState,
});

describe('generateDeeplinkHelper', () => {
    beforeEach(()=>{
        (window as any)[ADDITIONAL_PAGE_OPTIONS] = { optionPicker: {
            subscriptionIds: {
                consumer: [133, 134, 135, 136, 137],
                young: [138, 139, 140, 141, 142],
                default: {
                    consumer: 135,
                    young: 140,
                    soho: 0,
                    familyfriends: 0,
                    redplus: 0,
                },
            },
        } };
    });
    it('should generate a deeplink', () => {
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
        const deeplink = generateDeeplinkHelper(store.getState());

        expect(deeplink).toContain('/shop/warenkorb.html');
    });

    it('should generate a deeplink with tauschbonus', () => {
        const store = createStoreForTest({
            [appSlice.reducerPath]: {
                salesChannel: SALESCHANNEL_CONSUMER,
                deviceId: '123',
                isGigakombiEligible: true,
                gigakombiType: GIGAKOMBI_IP,
                isTradeIn: true,
                isTauschbonus: true,
            },
            [optionsSlice.reducerPath]: {
                atomicId: '123',
            },
            [tariffSlice.reducerPath]: {
                promotionalSummaryCardOffer: { offerPrice: 8 },
                subscriptionId: RED_M_VIRTUAL_ID,
            },
        } as RootState);
        const deeplink = generateDeeplinkHelper(store.getState());

        expect(deeplink).toEqual('/shop/warenkorb.html#/basket/eyJzQ2hhbiI6Ik9ubGluZS5Db25zdW1lciIsIlZWTCI6eyJIQVJEV0FSRUlEIjoiMTIzIiwiRElTQ09VTlRTIjpbeyJESVNDT1VOVElEIjoiMTc3In0seyJESVNDT1VOVElEIjoiMjYxOCJ9LHsiRElTQ09VTlRJRCI6IjI2MTkifSx7IkRJU0NPVU5USUQiOiIyMjQ2In0seyJESVNDT1VOVElEIjoiMjI0NyJ9LHsiRElTQ09VTlRJRCI6IjI3MTAifV19fQ==');
    });
});
