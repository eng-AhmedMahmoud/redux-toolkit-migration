import {
    SalesChannel,
    type GigakombiType,
} from '@vfde-sails/constants';

/**
 * Initial state
 */
export interface IInitialState {
    /**
     * Loading flags per API
     */
    loading: {
        startVvlAuth: boolean;
    };
    /**
     * Sales channel
     */
    salesChannel: SalesChannel | null;
    /**
     * Device Id
     */
    deviceId: string | null;
    /**
     * isSimonlyEligible
     */
    isSimonlyEligible: boolean;
    /**
     * isYoungEligible
     */
    isYoungEligible: boolean;
    /**
     * isRedplusEligible
     */
    isRedplusEligible: boolean;
    /**
     * isGigakombiEligible
     */
    isGigakombiEligible: boolean;
    /**
     * gigakombiType
     */
    gigakombiType: GigakombiType | null;
    /**
     * isTradeIn
     */
    isTradeIn: boolean;
    /**
     * isTauschbonus
     */
    isTauschbonus: boolean;
    /**
     * isTauschbonusEligible
     */
    isTauschbonusEligible: boolean;
}

/**
 * Interface of DeviceDetails Properties
 */
export interface StateProps {
    /**
     * Loading indicator
     */
    isLoading: boolean;
    /**
     * Error indicator
     */
    hasError: boolean;
    /**
     * salesChannel
     */
    salesChannel: SalesChannel | null;
    /**
     * isYoungEligible
     */
    isYoungEligible: boolean;
    /**
     * isRedplusEligible
     */
    isRedplusEligible: boolean;
    /**
     * subscriptionId
     */
    subscriptionId: string | null;
}
