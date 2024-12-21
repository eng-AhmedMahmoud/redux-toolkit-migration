import { mountPromotionalCardList } from '../../../helpers/promotionalCardHelper';
import { startAppListening } from '../../../app/listener';
import {
    selectActiveOffer,
    selectSubscriptionId,
} from '../selectors';
import {
    selectDeviceId,
    selectIsTauschbonus,
    selectIsTradeIn,
    selectSalesChannel,
} from '../../App/selectors';

/**
 * mount Promotional Cards
 */
export const mountPromotionalCards = () => {
    listenForUpdates();
};

/**
 * listen for mountPromotionalCards updates
 */
const listenForUpdates = () => {
    startAppListening({
        predicate: (_action, currentState, previousState) => {
            const subscriptionIdChanged = selectSubscriptionId(currentState) !== selectSubscriptionId(previousState);
            const salesChannelChanged = selectSalesChannel(currentState) !== selectSalesChannel(previousState);
            const activeOfferChanged = selectActiveOffer(currentState) !== selectActiveOffer(previousState);

            return subscriptionIdChanged
                || salesChannelChanged
                || (selectActiveOffer(currentState) !== null && (activeOfferChanged || subscriptionIdChanged));
        },
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const deviceId = selectDeviceId(state);
            const salesChannel = selectSalesChannel(state);
            const subscriptionId = selectSubscriptionId(state);
            const offer = selectActiveOffer(state);
            const isTauschbonus = selectIsTauschbonus(state);
            const isTradeIn = selectIsTradeIn(state);

            deviceId && salesChannel && subscriptionId && mountPromotionalCardList(deviceId, salesChannel, subscriptionId, offer, isTauschbonus, isTradeIn);
        },
    });
};
