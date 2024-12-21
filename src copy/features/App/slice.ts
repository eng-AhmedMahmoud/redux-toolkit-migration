import {
    PayloadAction,
    PrepareAction,
    createAction,
} from '@reduxjs/toolkit';
import { IInitialState } from './interfaces/state';
import { createAppSlice } from '../../app/createAppSlice';
import { SalesChannel } from '@vfde-sails/constants';
import { AppSlice } from './constants';
import { startAuthentication } from '@vfde-sails/vvl';
import { IAccordionItemProperties } from '@vfde-brix/ws10/accordion';

/**
 * Initial state
 */
const initialState: IInitialState = {
    loading: {
        startVvlAuth: false,
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

const appSlice = createAppSlice({ name: AppSlice,
    initialState,
    reducers: {
        setDefaultState: (state, action:PayloadAction<Omit<IInitialState, 'loading'>>) => {
            state.salesChannel = action.payload.salesChannel;
            state.deviceId = action.payload.deviceId;
            state.isSimonlyEligible = action.payload.isSimonlyEligible;
            state.isYoungEligible = action.payload.isYoungEligible;
            state.isGigakombiEligible = action.payload.isGigakombiEligible;
            state.gigakombiType = action.payload.gigakombiType;
            state.isTradeIn = action.payload.isTradeIn;
            state.isTauschbonus = action.payload.isTauschbonus;
            state.isTauschbonusEligible = action.payload.isTauschbonusEligible;
            state.isRedplusEligible = action.payload.isRedplusEligible;
        },
        setSalesChannel: (state, action: PayloadAction<SalesChannel>) => {
            state.salesChannel = action.payload;
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
        builder.addCase(startAuthentication.pending, state => {
            state.loading.startVvlAuth = true;
        }).addCase(startAuthentication.fulfilled, state => {
            state.loading.startVvlAuth = false;
        });
    } });
export default appSlice;

export const {
    setDefaultState,
    setSalesChannel,
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
