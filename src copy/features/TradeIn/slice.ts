import {
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import { IInitialState } from './interfaces/state';
import { Device } from './interfaces/api';
import { getTradeInDevices } from '../../api/tradeIn';
import { TRADEIN_SLICE } from './constants';

/**
 * Initial state
 */
const initialState: IInitialState = {
    isLoading: false,
    devices: null,
    hasError: false,
    isTradeInSelected: false,
    suggestInputValue: '',
    selectedTradeInDeviceId: null,
    isDeviceNotFound: false,
};

const tradeInSlice = createSlice({
    name: TRADEIN_SLICE,
    initialState,
    reducers: {
        setDefaultState: (state, action: PayloadAction<{ isTradeInSelected: boolean, selectedTradeInDevice: Device | null }>) => {
            if (action.payload.selectedTradeInDevice) {
                state.isTradeInSelected = action.payload.isTradeInSelected;
                state.selectedTradeInDeviceId = action.payload.selectedTradeInDevice.id;
                state.devices = [action.payload.selectedTradeInDevice];
            }
            else {
                state.isTradeInSelected = false;
            }
        },
        setIsTradeInSelected: (state, action: PayloadAction<boolean>) => {
            state.isTradeInSelected = action.payload;
        },
        setSuggestInputValue: (state, action: PayloadAction<string>) => {
            state.suggestInputValue = action.payload;
        },
        setDevices: (state, action: PayloadAction<Device[] | null>) => {
            state.devices = action.payload;
        },
        setSelectedTradeInDeviceId: (state, action: PayloadAction<string | null>) => {
            state.selectedTradeInDeviceId = action.payload;
        },
        deleteSelectedTradeInDevice: state => {
            state.selectedTradeInDeviceId = null;
        },
    },
    extraReducers: builder => {

        builder
            .addMatcher(getTradeInDevices.matchPending, state => {
                state.isLoading = true;
                state.hasError = false;
            })
            .addMatcher(getTradeInDevices.matchFulfilled, (state, action: PayloadAction<Device[] | null>) => {
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
            })
            .addMatcher(getTradeInDevices.matchRejected, state => {
                state.isLoading = false;
                state.hasError = true;
                state.devices = null;
            });
    },
});

// Export the reducer
export default tradeInSlice;

// Export actions
export const {
    setDefaultState,
    setIsTradeInSelected,
    setSuggestInputValue,
    setSelectedTradeInDeviceId,
    deleteSelectedTradeInDevice,
    setDevices,
} = tradeInSlice.actions;
