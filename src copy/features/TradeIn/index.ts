import {
    TAUSCHBONUS_PROMOTIONAL_CARD_CONTAINER_ID,
    TRADEIN_ITEM_SUMMERY_CARD_CONTAINER_ID,
    TRADEIN_OPTION_PICKER_CONTAINER_ID,
    TRADEIN_STATUS_NOTIFICATION_CONTAINER_ID,
    TRADEIN_SUGGEST_INPUT_CONTAINER_ID,
} from '../../app/constants';
import { mountButtonLinkForTradeIn } from './components/ButtonLinkForTradeIn';
import { mountTradeInFormSuggestInput } from './components/FormSuggestInput';
import { mountTradeInItemSummaryCard } from './components/ItemSummaryCard';
import { mountNotificationForSuggestInputStatus } from './components/NotificationForSuggestInputStatus';
import { mountTradeInOptionPicker } from './components/OptionPickerForTradeIn';
import { mountTauschbonusPromotionalCard } from './components/PromotionalCardForTauschbonus';
import { startListeners } from './listeners';
import {
    TAUSCHBONUS_OVERLAY_BUTTON_LINK,
    TRADE_IN_OVERLAY_BUTTON_LINK,
} from './constants';
import './style.scss';
import { useAppDispatch } from '../../app/store';
import { setDefaultState } from './slice';
import {
    getIsTradeIn,
    getTradeInDeviceFromStorage,
} from '../../helpers/getTradeInHelpers';

/**
 * Init tradeIn
 */
export const initTradeIn = () => {
    startListeners();

    // Check for TradeInDeviceFromStorage and send the value to setDefaultState
    const isTradeIn = getIsTradeIn();
    const dispatch = useAppDispatch();

    mountTauschbonusPromotionalCard(TAUSCHBONUS_PROMOTIONAL_CARD_CONTAINER_ID);
    mountTradeInOptionPicker(TRADEIN_OPTION_PICKER_CONTAINER_ID, isTradeIn);
    mountTradeInFormSuggestInput(TRADEIN_SUGGEST_INPUT_CONTAINER_ID);
    mountTradeInItemSummaryCard(TRADEIN_ITEM_SUMMERY_CARD_CONTAINER_ID);
    mountNotificationForSuggestInputStatus(TRADEIN_STATUS_NOTIFICATION_CONTAINER_ID);
    mountButtonLinkForTradeIn(TRADE_IN_OVERLAY_BUTTON_LINK);
    mountButtonLinkForTradeIn(TAUSCHBONUS_OVERLAY_BUTTON_LINK);

    dispatch(setDefaultState({ isTradeInSelected: isTradeIn, selectedTradeInDevice: getTradeInDeviceFromStorage() }));
};
