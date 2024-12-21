import { Device } from './api';
import { TariffWithHardwareOffer } from '@vfde-sails/glados-v2';
import { IInitialState as IInitialStateApp } from '../../App/interfaces/state';
import { IInitialState as IInitialStateTariff } from '../../Tariff/interface';

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

/**
 * Properties of Tradein Container
 */
export interface StateProps extends Pick<IInitialStateApp, 'isTauschbonus' | 'isTradeIn' | 'salesChannel' | 'deviceId' | 'isTauschbonusEligible'>, Pick<IInitialStateTariff, 'subscriptionId'> {
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
     * selected trade in device
     */
    selectedTradeInDevice: Device | null;
    /**
     * device not found
     */
    isDeviceNotFound: boolean;
    /**
     * offer
     */
    offer: TariffWithHardwareOffer | null;
}
