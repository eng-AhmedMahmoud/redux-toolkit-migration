import { toggleElementById } from '../../../helpers/domHelper';
import {
    PROMOTIONAL_SUMMARY_CARD_DATA_VOLUME,
    PROMOTIONAL_SUMMARY_CARD_HEADER_YOUNG_ICON_TEXT,
    PROMOTIONAL_SUMMARY_CARD_NOTIFICATION,
    PROMOTIONAL_SUMMARY_CARD_CONTENT,
} from '../constants';
import {
    ADDITIONAL_PAGE_OPTIONS,
    RED_XL_VIRTUAL_ID,
    YOUNG_XL_VIRTUAL_ID,
    YOUNG_XS_VIRTUAL_ID,
} from '@vfde-sails/constants';
import replaceCMSPlaceholder from '../../../helpers/replaceCMSPlaceholder';
import { PromotionalSummaryCardOffer } from '../interfaces/interface';
import { getMatchedDataVolumes } from '../../../helpers/gigaKombiPromotionalCardHelper';
import { Discount } from '@vfde-sails/glados-v2';

/**
 * Toggle the promotional Summary Card Elements based on subscriptionId and hasExtraGb boolean
 * @param subscriptionId the subscription Id
 */
export const togglePromotionalSummaryCardChildren = (
    subscriptionId: string | null,
    hasExtraGb: boolean,
    discount?: Discount | null,
    gigakombiSocs?: string[],
) => {
    const hasDataVolume = discount && gigakombiSocs && getMatchedDataVolumes(discount, gigakombiSocs).length;

    switch (true) {
        case subscriptionId === YOUNG_XS_VIRTUAL_ID:
            return togglePromotionalSummaryCard('notification');
        case !hasExtraGb ||
            subscriptionId === YOUNG_XL_VIRTUAL_ID ||
            subscriptionId === RED_XL_VIRTUAL_ID || !hasDataVolume:
            return togglePromotionalSummaryCard('noData');
        default:
            return togglePromotionalSummaryCard('default');
    }
};

/**
 * get the promotional summary card offer price info
 * @param { object } promotionalSummaryCardOffer the promotional summary card offer
 */
export const getPromotionalSummaryCardInfo = (
    promotionalSummaryCardOffer: PromotionalSummaryCardOffer,
): string => {
    const additionalPageOption = window[ADDITIONAL_PAGE_OPTIONS];
    const offerPriceInfo =
        additionalPageOption?.promotionalSummaryCard?.offerPriceInfo;
    const savedAmountTxt = replaceCMSPlaceholder(offerPriceInfo, {
        savedMoneyAmount: promotionalSummaryCardOffer.offerPrice?.toString(),
    });

    return savedAmountTxt;
};

/**
 * The function togglePromotionalSummaryCard used to toggle elements based on the card type
 *  @param { object } cardState is between notification - young - default - noData
 */
const togglePromotionalSummaryCard = (
    cardState: 'notification' | 'default' | 'noData',
) => {
    const promotionalSummaryCardIds = [
        PROMOTIONAL_SUMMARY_CARD_HEADER_YOUNG_ICON_TEXT,
        PROMOTIONAL_SUMMARY_CARD_NOTIFICATION,
        PROMOTIONAL_SUMMARY_CARD_DATA_VOLUME,
        PROMOTIONAL_SUMMARY_CARD_CONTENT,
    ];

    const toggleElements = {
        default: [
            PROMOTIONAL_SUMMARY_CARD_CONTENT,
            PROMOTIONAL_SUMMARY_CARD_DATA_VOLUME,
        ],
        notification: [
            PROMOTIONAL_SUMMARY_CARD_HEADER_YOUNG_ICON_TEXT,
            PROMOTIONAL_SUMMARY_CARD_NOTIFICATION,
        ],
        noData: [PROMOTIONAL_SUMMARY_CARD_CONTENT],
    };

    promotionalSummaryCardIds.map(id =>
        toggleElementById(id, !toggleElements[cardState].includes(id)),
    );
};
