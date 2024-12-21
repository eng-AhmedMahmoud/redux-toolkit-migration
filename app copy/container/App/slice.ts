import { IInitialState } from './interfaces/state';
import {
    createAction,
    createSlice,
    PayloadAction,
    PrepareAction,
} from '@reduxjs/toolkit';
import { IAccordionItemProperties } from '@vfde-brix/ws10/accordion';
import {
    GigakombiType,
    SalesChannel,
} from '@vfde-sails/constants';
// import {
//     VVL_AUTH_DONE,
//     vvlAuthenticationActionCreators,
//     vvlCustomerActionCreators,
// } from '@vfde-sails/vvl';
import { overlayActionDispatchers } from '../Overlay/actions';

/**
 * Initial state
 */
const initialState: IInitialState = {
    loading: {
        startVvlAuth: true,
    },
    salesChannel: null,
    deviceId: null,
    isSimonlyEligible: false,
    isYoungEligible: false,
    isRedplusEligible: false,
    isGigakombiEligible: false,
    gigakombiType: null,
    isTradeIn: false,
    isTauschbonus: false,
    isTauschbonusEligible: false,
};

const appSlice = createSlice({
    name: 'vvlDeviceDetailsApp',
    initialState,
    reducers: {
        setDefaultState: {
            reducer: (draft, action: PayloadAction<{
                salesChannel: SalesChannel | null,
                deviceId: string | null,
                isSimonlyEligible: boolean,
                isYoungEligible: boolean,
                isGigakombiEligible : boolean,
                gigakombiType: GigakombiType | null,
                isTradeIn: boolean,
                isTauschbonus: boolean,
                isTauschbonusEligible:boolean,
            }>) => {
                draft.salesChannel = action.payload.salesChannel;
                draft.deviceId = action.payload.deviceId;
                draft.isSimonlyEligible = action.payload.isSimonlyEligible;
                draft.isYoungEligible = action.payload.isYoungEligible;
                draft.isGigakombiEligible = action.payload.isGigakombiEligible;
                draft.gigakombiType = action.payload.gigakombiType;
                draft.isTradeIn = action.payload.isTradeIn;
                draft.isTauschbonus = action.payload.isTauschbonus;
                draft.isTauschbonusEligible = action.payload.isTauschbonusEligible;
            },
            prepare: (
                salesChannel: SalesChannel | null,
                deviceId: string | null,
                isSimonlyEligible: boolean,
                isYoungEligible: boolean,
                isGigakombiEligible : boolean,
                gigakombiType: GigakombiType | null,
                isTradeIn: boolean,
                isTauschbonus: boolean,
                isTauschbonusEligible: boolean,
            ) => ({
                payload: {
                    salesChannel,
                    deviceId,
                    isSimonlyEligible,
                    isYoungEligible,
                    isGigakombiEligible,
                    gigakombiType,
                    isTradeIn,
                    isTauschbonus,
                    isTauschbonusEligible,
                },
            }),
        },
        setSalesChannel: {
            reducer: (draft, action: PayloadAction<SalesChannel>) => {
                draft.salesChannel = action.payload;
            },
            prepare: (salesChannel: SalesChannel) => ({
                payload: salesChannel,
            }),
        },
        setIsRedplusEligible: (state, action: PayloadAction<boolean>) => {
            state.isRedplusEligible = action.payload;
        },
        setIsGigakombiEligible: (state, action: PayloadAction<boolean>) => {
            state.isGigakombiEligible = action.payload;
        },
        setIsTradeIn: (state, action: PayloadAction<boolean>) => {
            state.isTradeIn = action.payload;
            state.isTauschbonus = state.isTauschbonusEligible && state.isTradeIn;
        },
    },
    extraReducers: builder => {
        builder.addCase(VVL_AUTH_DONE, state => {
            state.loading.startVvlAuth = false;
        });
    },
});

export default appSlice;

export const {
    setDefaultState,
    setSalesChannel,
    setIsRedplusEligible,
    setIsGigakombiEligible,
    setIsTradeIn,
} = appSlice.actions;

export const goToBasket = createAction<void>(`${appSlice.name}/goToBasket`);
export const goToFamilyCard = createAction<void>(`${appSlice.name}/goToFamilyCard`);
export const trackPageView = createAction<void>(`${appSlice.name}/trackPageView`);
export const toggleAccordion = createAction<PrepareAction<Pick<IAccordionItemProperties, 'optOpen' | 'stdHeadline'>>>(
    `${appSlice.name}/toggleAccordionItem`,
    (accordionItemProperties: IAccordionItemProperties) => ({
        payload: {
            optOpen: accordionItemProperties.optOpen,
            stdHeadline: accordionItemProperties.stdHeadline,
        },
    }),
);

export const appActionDispatchers = {
    setSalesChannel,
    goToBasket,
    goToFamilyCard,
    trackPageView,
    toggleAccordion,
    // ...vvlAuthenticationActionCreators,
    // ...vvlCustomerActionCreators,
    ...overlayActionDispatchers,
};

/**
 * Action Dispatchers
 */
export type AppActionDispatchers = typeof appActionDispatchers;
