import { RootState } from '../../app/store';
import { createAppSelector } from '../../app/createAppSelector';
import { IInitialState } from './interfaces/state';

/**
 * Selects the `TradeIn state`
 */
const selectState = createAppSelector(
    [state=> state],
    (state: RootState) => state.TRADE_IN,
);
/**
 * Selects the `isLoading` state
 */
const selectIsLoading = createAppSelector(
    [selectState],
    (state: IInitialState) => state.isLoading,
);

/**
 * Selects the `hasError` state
 */
const selectHasError = createAppSelector(
    [selectState],
    (state: IInitialState) => state.hasError,
);

/**
 * Selects the `isTradeIn` state
 */
const selectTradeIn = createAppSelector(
    [selectState],
    (state: IInitialState) => !!(state.isTradeInSelected && state.selectedTradeInDeviceId),
);

/**
 * Selects the `isTradeInSelected` state
 */
const selectIsTradeInSelected = createAppSelector(
    [selectState],
    (state: IInitialState) => state.isTradeInSelected,
);

/**
 * Selects the trade-in input value
 */
const selectTradeInInputValue = createAppSelector(
    [selectState],
    (state: IInitialState) => state.suggestInputValue,
);

/**
 * Selects the selected trade-in device ID
 */
const selectSelectedTradeInDeviceId = createAppSelector(
    [selectState],
    (state: IInitialState) => state.selectedTradeInDeviceId,
);

/**
 * Selects the trade-in devices
 */
const selectTradeInDevices = createAppSelector(
    [selectState],
    (state: IInitialState) => state.devices || [],
);

/**
 * Selects the selected trade-in device
 */
const selectSelectedTradeInDevice = createAppSelector(
    [
        selectTradeInDevices,
        selectSelectedTradeInDeviceId,
    ],
    (devices, selectedTradeInDeviceId) => {
        if (devices.length === 0 || !selectedTradeInDeviceId) {
            return null;
        }

        return devices.find(device => device.id === selectedTradeInDeviceId) || null;
    },
);

/**
 * Selects the `isDeviceNotFound` state
 */
const selectIsDeviceNotFound = createAppSelector(
    [selectState],
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
