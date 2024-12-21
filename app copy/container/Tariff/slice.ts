import {
    createAction,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import {
    IInitialState,
    PromotionalSummaryCardOffer,
} from './interface';
import { TariffWithHardwareResponse } from '@vfde-sails/glados-v2';
import {
    RedTariff,
    YoungTariff,
} from '@vfde-sails/constants';
import { appActionDispatchers } from '../App/slice';
import { overlayActionDispatchers } from '../Overlay/actions';

/**
 * Initial state
 */
const initialState: IInitialState = {
    loading: {
        getSubscription: true,
    },
    errors: {
        getSubscription: false,
    },
    subscriptionId: null,
    subscriptionPayload: null,
    promotionalSummaryCardOffer: { offerPrice: null },
};

const tariffSlice = createSlice({
    name: 'vvlDeviceDetailsTariff',
    initialState,
    reducers: {
        getSubscriptions: state => {
            state.loading.getSubscription = true;
        },
        getSubscriptionsSuccess: (state, action: PayloadAction<TariffWithHardwareResponse<RedTariff | YoungTariff>>) => {
            state.loading.getSubscription = false;
            state.errors.getSubscription = false;
            state.subscriptionPayload = action.payload;
        },
        getSubscriptionsFailed: state => {
            state.loading.getSubscription = false;
            state.errors.getSubscription = true;
        },
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
    getSubscriptions,
    getSubscriptionsSuccess,
    getSubscriptionsFailed,
    setSubscriptionId,
    setPromotionalSummaryCardOffer,
} = tariffSlice.actions;

export const setDefaultState = createAction(`${tariffSlice.name}/setDefaultState`);

export const tariffActionDispatchers = {
    setSubscriptionId,
    setDefaultState,
    setPromotionalSummaryCardOffer,
    ...appActionDispatchers,
    ...overlayActionDispatchers,
};

/**
 * Action Dispatchers
 */
export type TariffActionDispatchers = typeof tariffActionDispatchers;
