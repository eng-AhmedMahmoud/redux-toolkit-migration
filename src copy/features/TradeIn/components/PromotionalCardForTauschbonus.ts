import { PromotionalCard } from '@vfde-brix/ws10/promotional-card';
import { getTotalTauschbonusAmount } from '@vfde-sails/page-options';
import { startAppListening } from '../../../app/listener';
import { mountPromotionalCardById } from '../../../components/PromotionalCard';
import {
    selectDeviceId,
    selectIsTauschbonus,
    selectIsTauschbonusEligible,
    selectIsTradeIn,
    selectSalesChannel,
} from '../../App/selectors';
import { updateTauschbonus } from '../../../helpers/getTauschbonusHelpers';
import { mountPromotionalCardList } from '../../../helpers/promotionalCardHelper';
import {
    selectActiveOffer,
    selectSubscriptionId,
} from '../../Tariff/selectors';

/**
 * Mounts the tauschbonus promotionalCard
 */
export const mountTauschbonusPromotionalCard = (containerId: string): PromotionalCard | null => {
    const promotionalCard = mountPromotionalCardById(containerId);

    /* istanbul ignore if */
    if (!promotionalCard) {
        return null;
    }

    listenForUpdates(promotionalCard);

    return promotionalCard;
};

const listenForUpdates = (promotionalCard: PromotionalCard) => {

    startAppListening({
        predicate: (_action, currentState, previousState) =>
            (selectIsTauschbonusEligible(currentState) !== selectIsTauschbonusEligible(previousState) && selectIsTauschbonusEligible(currentState)),
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const deviceId = selectDeviceId(state);
            const tauschbonusValue = getTotalTauschbonusAmount(deviceId!);

            if (tauschbonusValue && promotionalCard) {
                // display tauschbonus promotional card
                promotionalCard.toggleContainer(false, true, false);
                // update tauschbonus promotional card when get tauschbonus total value
                updateTauschbonus(promotionalCard, tauschbonusValue);
            }
        },
    });
    startAppListening({
        predicate: (_action, currentState, previousState) =>
            selectIsTradeIn(currentState) !== selectIsTradeIn(previousState) ||
            selectIsTauschbonus(currentState) !== selectIsTauschbonus(previousState),
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const deviceId = selectDeviceId(state);
            const salesChannel = selectSalesChannel(state);
            const subscriptionId = selectSubscriptionId(state);
            const offer = selectActiveOffer(state);
            const isTauschbonus = selectIsTauschbonus(state);
            const isTradeIn = selectIsTradeIn(state);

            // Mount tradein promotional card
            deviceId && salesChannel && subscriptionId && mountPromotionalCardList(
                deviceId,
                salesChannel,
                subscriptionId,
                offer,
                isTauschbonus,
                isTradeIn,
            );
        },
    });
};

