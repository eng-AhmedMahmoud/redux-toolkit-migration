import {
    createAction,
    PayloadAction,
} from '@reduxjs/toolkit';
import {
    IInitialState,
    PromotionalSummaryCardOffer,
} from './interfaces/interface';
import {
    RedTariff,
    YoungTariff,
} from '@vfde-sails/constants';
import { createAppSlice } from '../../app/createAppSlice';

/**
 * Initial state
 */
const initialState: IInitialState = {
    subscriptionId: null,
    promotionalSummaryCardOffer: { offerPrice: null },
};

const tariffSlice = createAppSlice({
    name: 'vvlDeviceDetailsTariff',
    initialState,
    reducers: {
        setSubscriptionId: {
            reducer: (draft, action: PayloadAction<{subscriptionId: RedTariff | YoungTariff; updateStorage: boolean; shouldTrackPageView: boolean}>) => {
                draft.subscriptionId = action.payload.subscriptionId;
            },
            prepare: (
                subscriptionId: RedTariff | YoungTariff,
                updateStorage = true,
                shouldTrackPageView = true,
            ) => ({
                payload: {
                    subscriptionId,
                    updateStorage,
                    shouldTrackPageView,
                },
            }),
        },
        setPromotionalSummaryCardOffer: (state, action: PayloadAction<PromotionalSummaryCardOffer>) => {
            state.promotionalSummaryCardOffer = action.payload;
        },
    },
});

export default tariffSlice;

export const {
    setSubscriptionId,
    setPromotionalSummaryCardOffer,
} = tariffSlice.actions;

export const setDefaultState = createAction(`${tariffSlice.name}/setDefaultState`);
