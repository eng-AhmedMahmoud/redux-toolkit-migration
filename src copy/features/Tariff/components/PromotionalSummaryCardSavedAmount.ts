import { IconText } from '@vfde-brix/ws10/icon-text';
import { startAppListening } from '../../../app/listener';
import {
    mountIconText,
    updateIconText,
} from '../../../components/IconText';
import {
    selectPromotionalSummaryCardOffer,
    selectSubscriptionId,
} from '../selectors';
import { YOUNG_S_VIRTUAL_ID } from '@vfde-sails/constants';
import { getPromotionalSummaryCardInfo } from '../helpers/promotionalSummaryCardHelpers';

/**
 * mount Promotional Summary Card Saved Amount
 */
export const mountPromotionalSummaryCardSavedAmount = (containerId: string) => {
    const promotionalSummaryCardSavedAmount = mountIconText(
        containerId,
    );

    listenForUpdates(promotionalSummaryCardSavedAmount);
};

/**
 * listen for mountPromotionalSummaryCardSavedAmount updates
 */
const listenForUpdates = (promotionalSummaryCardSavedAmount: IconText) => {
    startAppListening({
        predicate: (_action, currentState, previousState) => {
            const subscriptionIdChanged = selectSubscriptionId(currentState) !== selectSubscriptionId(previousState) && selectSubscriptionId(currentState) !== YOUNG_S_VIRTUAL_ID;
            const offerPriceChanged = selectPromotionalSummaryCardOffer(currentState).offerPrice !== selectPromotionalSummaryCardOffer(previousState).offerPrice;

            return selectPromotionalSummaryCardOffer(currentState).offerPrice && subscriptionIdChanged
                || offerPriceChanged;
        },
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const promotionalSummaryCardOffer = selectPromotionalSummaryCardOffer(state);

            const savedAmountTxt = getPromotionalSummaryCardInfo(promotionalSummaryCardOffer);
            updateIconText(promotionalSummaryCardSavedAmount, savedAmountTxt);
        },
    });
};
