import { startAppListening } from '../../../app/listener';
import { toggleElementById } from '../../../helpers/domHelper';
import { getIsGigaKombiTvOrNotEligible } from '../helpers/TariffOverlayButtonLinkHelpers';
import {
    selectActiveOffer,
    selectPromotionalSummaryCardOffer,
    selectSubscriptionId,
} from '../selectors';
import { MEDIA_TEXT_CARD } from '../constants';
import {
    hasExtraGb as checkHasExtraGb,
    getGigakombiDiscountSocs,
} from '@vfde-sails/page-options';
import {
    GigakombiType,
    SalesChannel,
} from '@vfde-sails/constants';
import { getGigakombiType } from '../../../helpers/getUserDataHelper';
import { selectSalesChannel } from '../../App/selectors';
import { togglePromotionalSummaryCardChildren } from '../helpers/promotionalSummaryCardHelpers';

/**
 * mount Promotional Summary Card Offer
 */
export const mountPromotionalSummaryCardOffer = (containerId: string) => {
    const isGigaKombiTvOrNotEligible = getIsGigaKombiTvOrNotEligible();
    toggleElementById(containerId, isGigaKombiTvOrNotEligible);

    listenForUpdates(containerId);
};

/**
 * listen for mountPromotionalSummaryCardOffer updates
 */
const listenForUpdates = (containerId: string) => {
    startAppListening({
        predicate: (_action, currentState, previousState) => {
            const subscriptionIdChanged = selectSubscriptionId(currentState) !== selectSubscriptionId(previousState);
            const offerPriceChanged = selectPromotionalSummaryCardOffer(currentState).offerPrice !== selectPromotionalSummaryCardOffer(previousState).offerPrice;

            return selectPromotionalSummaryCardOffer(currentState).offerPrice && subscriptionIdChanged
                || offerPriceChanged;
        },
        effect: (_action, listenerApi) => {
            const gigakombiType = getGigakombiType();

            const state = listenerApi.getState();
            const salesChannel = selectSalesChannel(state);
            const subscriptionId = selectSubscriptionId(state);
            const offer = selectActiveOffer(state);

            toggleElementById(containerId, false);
            toggleElementById(MEDIA_TEXT_CARD, false);

            const hasExtraGb = checkHasExtraGb(salesChannel as SalesChannel, gigakombiType as GigakombiType);
            const gigakombiSocs: string[] = getGigakombiDiscountSocs(salesChannel!, undefined, gigakombiType!);
            togglePromotionalSummaryCardChildren(subscriptionId, hasExtraGb, offer?.discount, gigakombiSocs);

        },
    });
};
