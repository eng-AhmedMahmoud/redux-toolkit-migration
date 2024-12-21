import {
    MAP_TARIFF_ID_TO_SALESCHANNEL,
    SAILS_PARAM_CUSTOMER,
    SAILS_PARAM_DEVICE_ID,
    SAILS_PARAM_SALESCHANNEL,
    SAILS_PARAM_SUB_ID,
    SAILS_VVL_STORAGE,
    SALESCHANNEL_CONSUMER,
    SALESCHANNEL_YOUNG,
    SalesChannel,
    URL_PARAM_SUBGROUP_ID,
    RedTariff,
    YoungTariff,
    ADDITIONAL_PAGE_OPTIONS,
    type GigakombiType,
} from '@vfde-sails/constants';
import {
    getSessionStorageItemJson,
    SailsVvlStorage,
} from '@vfde-sails/storage';
import { getQueryParam } from '@vfde-sails/utils';
import { getAllSubscriptionIdsFromCms } from './tariffOptionPickerHelpers';

/**
 * Get the saleschannel
 */
export const getSalesChannel = (): SalesChannel | null => {
    const storage = getSessionStorageItemJson<SailsVvlStorage>(SAILS_VVL_STORAGE);
    const urlParamSubGroupId = getSubscriptionIdFromUrl();

    return urlParamSubGroupId ? getSalesChannelBasedOnSubscriptionId(`${urlParamSubGroupId}`) : storage && storage[SAILS_PARAM_SALESCHANNEL];
};

/**
 * Get isGigakombiEligible from storage
 */
export const getIsGigakombiEligible = (): boolean => {
    const storage =
        getSessionStorageItemJson<SailsVvlStorage>(SAILS_VVL_STORAGE);
    const isGigakombiEligible = storage?.[SAILS_PARAM_CUSTOMER]?.isGigakombiEligible ?? false;

    return isGigakombiEligible;
};

/**
 * Get the device Id
 */
export const getDeviceId = (): string | null => getDeviceIdFromUrl() ?? getDeviceIdFromStorage();

/**
 * Get Device Id from URL
 */
export const getDeviceIdFromUrl = (): string | null => {
    const deviceIdFromUrl = getQueryParam(SAILS_PARAM_DEVICE_ID);

    return deviceIdFromUrl || null;
};

/**
 * Get Device Id from storage
 */
export const getDeviceIdFromStorage = (): string | null => {
    const storage = getSessionStorageItemJson<SailsVvlStorage>(SAILS_VVL_STORAGE);
    const deviceId = storage?.[SAILS_PARAM_DEVICE_ID];

    return deviceId?.toString() || null;
};

/**
 * Get the subscription Id
 */
export const getSubscriptionId = (salesChannel: SalesChannel): RedTariff | YoungTariff | null => getSubscriptionIdFromUrl() ?? getSubscriptionIdFromStorage(salesChannel) ?? getDefaultSubscriptionId(salesChannel);

/**
 * Get subscription Id from storage
 */
export const getSubscriptionIdFromStorage = (salesChannel: SalesChannel): RedTariff | YoungTariff | null => {
    const storage = getSessionStorageItemJson<SailsVvlStorage>(SAILS_VVL_STORAGE);
    const subscriptionId = storage?.[SAILS_PARAM_SUB_ID]?.[salesChannel] as RedTariff | YoungTariff;

    if (subscriptionId && isValidSubscriptionId(subscriptionId)) {
        return subscriptionId;
    }

    return null;
};

/**
 * Get subscription Id from Url
 */
export const getSubscriptionIdFromUrl = (): RedTariff | YoungTariff | null => {
    const urlParamSubGroupId = getQueryParam(URL_PARAM_SUBGROUP_ID) as (RedTariff | YoungTariff);

    if (urlParamSubGroupId && isValidSubscriptionId(urlParamSubGroupId)) {
        return urlParamSubGroupId;
    }

    return null;
};

/**
 * Get default subscription Id from the dom
 */
export const getDefaultSubscriptionId = (salesChannel: SalesChannel): RedTariff | YoungTariff | null => {
    const { subscriptionIds } = window[ADDITIONAL_PAGE_OPTIONS].optionPicker;
    const defaultSubscription = subscriptionIds.default[salesChannel]?.toString() as (RedTariff | YoungTariff | null);

    return subscriptionIds && defaultSubscription;
};

/**
 * Get isSimonlyEligible from storage
 */
export const getIsSimonlyEligible = (): boolean => {
    const storage = getSessionStorageItemJson<SailsVvlStorage>(SAILS_VVL_STORAGE);
    const isSimonlyEligible = storage?.[SAILS_PARAM_CUSTOMER]?.isSimonlyEligible ?? false;

    return isSimonlyEligible;
};

/**
 * Get isYoungEligible from storage
 */
export const getIsYoungEligible = (): boolean => {
    const storage = getSessionStorageItemJson<SailsVvlStorage>(SAILS_VVL_STORAGE);
    const isYoungEligible = storage?.[SAILS_PARAM_CUSTOMER]?.isYoungEligible ?? false;

    return isYoungEligible;
};

/**
 * Get IsWinbackCustomer from storage
 */
export const getIsWinbackCustomer = (): boolean => {
    const storage = getSessionStorageItemJson<SailsVvlStorage>(SAILS_VVL_STORAGE);
    const isWinbackCustomer = storage?.[SAILS_PARAM_CUSTOMER]?.isWinbackCustomer ?? false;

    return isWinbackCustomer;
};

/**
 * Get IsRedplusEligible from storage
 */
export const getIsRedplusEligible = (): boolean => {
    const storage = getSessionStorageItemJson<SailsVvlStorage>(SAILS_VVL_STORAGE);
    const isRedplusEligible = storage?.[SAILS_PARAM_CUSTOMER]?.isRedplusEligible ?? false;

    return isRedplusEligible;
};

/**
 * Get gigakombiType from storage
 */
export const getGigakombiType = (): GigakombiType | null => {
    const storage = getSessionStorageItemJson<SailsVvlStorage>(SAILS_VVL_STORAGE);
    const gigakombiType = storage && storage[SAILS_PARAM_CUSTOMER]?.gigakombiType;

    return gigakombiType || null;
};

/**
 * isValidSubscriptionId
 */
export const isValidSubscriptionId = (subscriptionId: RedTariff | YoungTariff): boolean => {
    const subscriptionIds = getAllSubscriptionIdsFromCms();

    return subscriptionIds.indexOf(subscriptionId) !== -1
    && !(MAP_TARIFF_ID_TO_SALESCHANNEL[subscriptionId].indexOf(SALESCHANNEL_YOUNG) !== -1 && !getIsYoungEligible());
};

/**
 * Get IsWinbackCustomer from storage
 */

/**
 *
 */
export const getSalesChannelBasedOnSubscriptionId = (subscriptionId: RedTariff | YoungTariff): SalesChannel | null => {
    if (!(subscriptionId in MAP_TARIFF_ID_TO_SALESCHANNEL) || !isValidSubscriptionId(subscriptionId)) {
        return null;
    }

    let salesChannel = null;

    if (MAP_TARIFF_ID_TO_SALESCHANNEL[subscriptionId].indexOf(SALESCHANNEL_YOUNG) !== -1) {
        salesChannel = SALESCHANNEL_YOUNG as SalesChannel;
    }
    else if (MAP_TARIFF_ID_TO_SALESCHANNEL[subscriptionId].indexOf(SALESCHANNEL_CONSUMER) !== -1) {
        salesChannel = SALESCHANNEL_CONSUMER as SalesChannel;
    }

    return salesChannel;
};
