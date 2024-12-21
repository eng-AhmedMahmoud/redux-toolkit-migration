import { getIsTauschbonusEligible } from '../../../helpers/getTauschbonusHelpers';
import { getIsTradeIn } from '../../../helpers/getTradeInHelpers';
import {
    getDeviceId,
    getIsGigakombiEligible,
    getIsSimonlyEligible,
    getIsYoungEligible,
    getSalesChannel,
    getGigakombiType,
} from '../../../helpers/getUserDataHelper';
import {
    GigakombiType,
    SalesChannel,
} from '@vfde-sails/constants';

/**
 * Gets the default state params
 * @returns {object} Returns the new default properties as an object.
 */
export const getDefaultState = (): {
    salesChannel: SalesChannel | null;
    deviceId: string | null;
    isSimonlyEligible: boolean;
    isYoungEligible: boolean;
    isGigakombiEligible: boolean;
    gigakombiType: GigakombiType | null;
    isTradeIn: boolean;
    isTauschbonus: boolean;
    isTauschbonusEligible: boolean;
} => {
    const defaultState = {
        salesChannel: getSalesChannel(),
        deviceId: getDeviceId(),
        isSimonlyEligible: getIsSimonlyEligible(),
        isYoungEligible: getIsYoungEligible(),
        isGigakombiEligible: getIsGigakombiEligible(),
        gigakombiType: getGigakombiType(),
        isTradeIn: getIsTradeIn(),
        isTauschbonus: getIsTauschbonusEligible(getDeviceId()!) && getIsTradeIn(),
        isTauschbonusEligible: getIsTauschbonusEligible(getDeviceId()!),
    };

    return defaultState;
};
