import {
    PayloadAction,
    createSlice,
} from '@reduxjs/toolkit';
import { IInitialState } from './interfaces/state';
import { Device } from './interfaces/api';
import { CONTAINER_TRADE_IN } from 'Constant';
import { getOverlayContent } from '../Overlay/actions';
import { setPromotionalSummaryCardOffer } from 'Container/Tariff/slice';

/**
 * Initial state
 */
export const initialState: IInitialState = {
    isLoading: false,
    devices: null,
    hasError: false,
    isTradeInSelected: false,
    suggestInputValue: '',
    selectedTradeInDeviceId: null,
    isDeviceNotFound: false,
};

const tradeInSlice = createSlice({
    name: CONTAINER_TRADE_IN,
    initialState,
    reducers: {
        setDefaultState: {
            reducer: (state, action: PayloadAction<{ isTradeInSelected: boolean, selectedTradeInDevice: Device | null }>) => {
                if (action.payload.selectedTradeInDevice) {
                    state.isTradeInSelected = action.payload.isTradeInSelected;
                    state.selectedTradeInDeviceId = action.payload.selectedTradeInDevice.id;
                    state.devices = [action.payload.selectedTradeInDevice];
                }
                else {
                    state.isTradeInSelected = false;
                }
            },
            prepare: (isTradeInSelected: boolean, selectedTradeInDevice: Device | null) => ({
                payload: {
                    isTradeInSelected,
                    selectedTradeInDevice,
                },
            }),
        },
        setIsTradeInSelected: (state, action: PayloadAction<boolean>) => {
            state.isTradeInSelected = action.payload;
        },
        setSuggestInputValue: (state, action: PayloadAction<string>) => {
            state.suggestInputValue = action.payload;
        },
        setSelectedTradeInDeviceId: (state, action: PayloadAction<string | null>) => {
            state.selectedTradeInDeviceId = action.payload;
        },
        getTradeInDevices: state => {
            state.isLoading = true;
        },
        getTradeInDevicesSuccess: (state, action: PayloadAction<Device[] | null>) => {
            if (!state.selectedTradeInDeviceId) {
                // Only set the devices if there is no selected device yet.
                // Otherwise it is possible that we undo the device-selection
                // since we only store the device ID in the state
                // and require the device object itself with this ID
                // to be present in the array.
                state.devices = action.payload;
            }

            state.isLoading = false;
            state.hasError = false;
        },
        getTradeInDevicesFailed: state => {
            state.isLoading = false;
            state.hasError = true;
            state.devices = null;
        },
        deleteSelectedTradeInDevice: state => {
            state.selectedTradeInDeviceId = null;
        },
    },
});

export default tradeInSlice;

export const {
    setDefaultState,
    setIsTradeInSelected,
    getTradeInDevices,
    setSuggestInputValue,
    setSelectedTradeInDeviceId,
    getTradeInDevicesSuccess,
    getTradeInDevicesFailed,
    deleteSelectedTradeInDevice,
} = tradeInSlice.actions;

export const tradeInActionDispatchers = {
    setIsTradeInSelected,
    setDefaultState,
    getTradeInDevices,
    setSuggestInputValue,
    setSelectedTradeInDeviceId,
    getTradeInDevicesSuccess,
    getTradeInDevicesFailed,
    getOverlayContent,
    setPromotionalSummaryCardOffer,
    deleteSelectedTradeInDevice,

};

/**
 * Action Dispatchers
 */
export type TradeInActionDispatchers = typeof tradeInActionDispatchers;
