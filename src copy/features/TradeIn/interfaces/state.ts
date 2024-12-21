import { Device } from './api';

/**
 * TradeIn initial state
 */
export interface IInitialState {
    /**
     * Loading indicator
     */
    isLoading: boolean;
    /**
     * Toggle Error Notification
     */
    hasError: boolean;
    /**
     * The List of Devices from TradeIn API
     */
    devices: Device[] | null;
    /**
     * Current state of TardeIn OptionPicker
     * `true` if 'yes', `false` if 'no'
     */
    isTradeInSelected: boolean;
    /**
     * FormSuggestInput current value
     */
    suggestInputValue: string;
    /**
     * the current selected TardeIn device id
     */
    selectedTradeInDeviceId: string | null;
    /**
     * device not found
     */
    isDeviceNotFound: boolean;
}

