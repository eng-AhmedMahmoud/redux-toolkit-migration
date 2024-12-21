import {
    ADDITIONAL_PAGE_OPTIONS,
    RedTariff,
    SALESCHANNEL_CONSUMER,
    SALESCHANNEL_YOUNG,
    SalesChannel,
    YoungTariff,
} from '@vfde-sails/constants';
import replaceCMSPlaceholder from './replaceCMSPlaceholder';
import formatDataVolume from './dataVolumeHelper';
import { TariffWithHardwareOffer } from '@vfde-sails/glados-v2';

/**
 * Adjust Tariff Name According to SalesChannel
 * @param {SalesChannel|null|undefined} salesChannel
 * sales channel
 * @param {string} tariffTitle
 * tariff title before truncate
 * @returns {string}
 * return truncated tariff info
 */
export const truncateGigaMobileFromYoungTariffName = (salesChannel: SalesChannel | null | undefined, tariffTitle: string): string => {
    if (salesChannel !== SALESCHANNEL_YOUNG) {
        return tariffTitle;
    }

    return tariffTitle.replace('GigaMobil ', '');
};

/**
 * Function to update Tariff Info from cms
 * @param {TariffWithHardwareOffer|undefined} offer
 * offer data coming from the backend
 * @returns {string | undefined}
 * returned tariff info text
 */
export const getTariffOptionPickerInfo = (offer: TariffWithHardwareOffer): string => {
    const { tariffInfo, unlimitedTariffInfo } = window[ADDITIONAL_PAGE_OPTIONS].optionPicker;
    let tariffInfoText;

    // updating the rendered tariffInfo text depending on data coming from the cms
    if (offer.dataVolume.withoutDiscounts!.unlimited || offer.dataVolume.withoutDiscounts!.value === -1) {
        tariffInfoText = unlimitedTariffInfo;
    }
    else if (!offer.dataVolume.withDiscounts) {
        tariffInfoText = formatDataVolume(offer.dataVolume.withoutDiscounts!.value.toString()).concat(` ${offer.dataVolume.withoutDiscounts!.unit}`);
    }
    else if (offer.dataVolume.withDiscounts[0].value === -1) {
        tariffInfoText = replaceCMSPlaceholder(tariffInfo, {
            dataWithdiscountData: unlimitedTariffInfo,
            dataWithoutDiscount: formatDataVolume(offer.dataVolume.withoutDiscounts!.value.toString()).concat(` ${offer.dataVolume.withoutDiscounts!.unit}`),
        });
    }
    else {
        tariffInfoText = replaceCMSPlaceholder(tariffInfo, {
            dataWithdiscountData: formatDataVolume(offer.dataVolume.withDiscounts[0].value.toString()).concat(` ${offer.dataVolume.withDiscounts[0].unit}`) || undefined,
            dataWithoutDiscount: formatDataVolume(offer.dataVolume.withoutDiscounts!.value.toString()).concat(` ${offer.dataVolume.withoutDiscounts!.unit}`),
        });
    }

    return tariffInfoText;
};

/**
 * Function to get the Subscription Ids From the Cms
 * @param {SalesChannel} salesChannel
 * sales channel
 * @returns {(RedTariff | YoungTariff)[]}
 * returned array of subscription ids
 */
export const getSubscriptionIdsFromCms = (salesChannel: SalesChannel): (RedTariff | YoungTariff)[] => {
    const { subscriptionIds } = window[ADDITIONAL_PAGE_OPTIONS].optionPicker;

    return subscriptionIds[salesChannel]?.map(String) as (RedTariff | YoungTariff)[] || [];
};

/**
 * Function to Get Subscription Ids From API
 * @returns {(RedTariff | YoungTariff)[] }
 * returned grouped subscription ids
 */
export const getAllSubscriptionIdsFromCms = (): (RedTariff | YoungTariff)[] => {
    const gigamobilSubscriptionIdsFromApi = getSubscriptionIdsFromCms(SALESCHANNEL_CONSUMER) as RedTariff[];
    const gigamobilYoungSubscriptionIdsFromApi = getSubscriptionIdsFromCms(SALESCHANNEL_YOUNG) as YoungTariff[];

    return [...gigamobilSubscriptionIdsFromApi, ...gigamobilYoungSubscriptionIdsFromApi];
};

/**
 * check the subscription selected by default is exist in our api response or not
 */
export const checkSubscriptionIdExistsInSubscriptions = (subscriptionId:(RedTariff | YoungTariff), subscriptionPayload:TariffWithHardwareOffer[]):boolean => subscriptionPayload.some(subscription=>subscription.virtualItemId === subscriptionId);
