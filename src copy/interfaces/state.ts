import {
    FlowType,
    RedTariff,
    RedplusTariff,
    SalesChannel,
    YoungTariff,
} from '@vfde-sails/constants';

/**
 * Interface for CustomerConfig
 */
export interface CustomerConfig {
    /* eslint-disable jsdoc/require-jsdoc */
    salesChannel: SalesChannel;
    subscriptionId: RedTariff | YoungTariff | RedplusTariff | null;
    deviceId: string | null;
    atomicId: string | null;
    isGigakombi: boolean;
    isTauschbonusEligible: boolean;
    isTauschbonus: boolean;
    isTradeIn: boolean;
    isInsurance: boolean;
    isHardwareOnly: boolean;
    isRestlaufzeit: boolean;
    isGigakombiEligible: boolean;
    flowType: FlowType;
    /* eslint-enable jsdoc/require-jsdoc */
}
