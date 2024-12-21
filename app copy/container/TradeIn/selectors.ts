import {
    Selector,
    createSelector,
} from 'reselect';
import { IInitialState } from './interfaces/state';
import {
    createDeepEqualSelectorOutput,
    RootState,
} from '@vfde-sails/core';
import tradeInSlice from './slice';
import type { Device } from './interfaces/api';

const selectState = (state: RootState<IInitialState>) =>
    state[tradeInSlice.name] || tradeInSlice.getInitialState();

const selectIsLoading = (): Selector<RootState<IInitialState>, IInitialState['isLoading']> =>
    createSelector(
        selectState,
        (state: IInitialState) => state.isLoading,
    );

const selectHasError = (): Selector<RootState<IInitialState>, IInitialState['hasError']> =>
    createSelector(
        selectState,
        (state: IInitialState) => state.hasError,
    );

const selectTradeIn = (): Selector<RootState<IInitialState>, boolean> =>
    createSelector(
        selectState,
        (state: IInitialState) => !!(state.isTradeInSelected && state.selectedTradeInDeviceId),
    );

const selectIsTradeInSelected = (): Selector<RootState<IInitialState>, IInitialState['isTradeInSelected']> =>
    createSelector(
        selectState,
        (state: IInitialState) => state.isTradeInSelected,
    );

const selectTradeInInputValue = (): Selector<RootState<IInitialState>, IInitialState['suggestInputValue']> =>
    createSelector(
        selectState,
        (state: IInitialState) => state.suggestInputValue,
    );

const selectSelectedTradeInDeviceId = (): Selector<RootState<IInitialState>, IInitialState['selectedTradeInDeviceId']> =>
    createSelector(
        selectState,
        (state: IInitialState) => state.selectedTradeInDeviceId,
    );

const selectTradeInDevices = (): Selector<RootState<IInitialState>, Exclude<IInitialState['devices'], null>> =>
    createDeepEqualSelectorOutput(
        selectState,
        (state: IInitialState) => state.devices || [],
    );

const selectSelectedTradeInDevice = (): Selector<RootState<IInitialState>, Device | null> =>
    createDeepEqualSelectorOutput(
        selectTradeInDevices(),
        selectSelectedTradeInDeviceId(),
        (devices, selectedTradeInDeviceId) => {
            if (devices.length === 0 || !selectedTradeInDeviceId) {
                return null;
            }

            return devices.find(device => device.id === selectedTradeInDeviceId) || null;
        },
    );

const selectIsDeviceNotFound = (): Selector<RootState<IInitialState>, boolean> =>
    createSelector(
        selectState,
        (state: IInitialState) => !!state.devices && state.devices.length === 0,
    );

export {
    selectState,
    selectIsLoading,
    selectHasError,
    selectTradeIn,
    selectIsTradeInSelected,
    selectTradeInInputValue,
    selectSelectedTradeInDevice,
    selectSelectedTradeInDeviceId,
    selectTradeInDevices,
    selectIsDeviceNotFound,
};
