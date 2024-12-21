import './style.scss';
import {
    connect,
    injectSaga,
    RootState,
} from '@vfde-sails/core';
import { createStructuredSelector } from 'reselect';
import { IInitialState as IInitialStateApp } from '../App/interfaces/state';
import {
    IInitialState as IInitialStateTradeIn,
    StateProps,
} from './interfaces/state';
import { IInitialState as IInitialStateTariff } from '../Tariff/interface';
import { IInitialState as IInitialStateOptions } from '../Options/interface';
import tradeInSaga from './saga';
import {
    tradeInActionDispatchers,
    TradeInActionDispatchers,
} from './slice';
import {
    selectHasError,
    selectIsDeviceNotFound,
    selectIsLoading,
    selectIsTradeInSelected,
    selectSelectedTradeInDevice,
    selectTradeInDevices,
    selectTradeInInputValue,
} from './selectors';
import mountTradeInOptionPicker from '../../components/TradeInOptionPicker';
import mountItemSummaryCard, { updateItemSummaryCard } from '../../components/ItemSummaryCard';
import {
    TAUSCHBONUS_OVERLAY,
    TAUSCHBONUS_OVERLAY_BUTTON_LINK,
    TAUSCHBONUS_PROMOTIONAL_CARD_CONTAINER_ID,
    TRADE_IN_OVERLAY,
    TRADE_IN_OVERLAY_BUTTON_LINK,
    TRADEIN_ITEM_SUMMERY_CARD_CONTAINER_ID,
    TRADEIN_OPTION_PICKER_CONTAINER_ID,
    TRADEIN_STATUS_NOTIFICATION_CONTAINER_ID,
    TRADEIN_SUGGEST_INPUT_CONTAINER_ID,
} from './constants';
import {
    getIsTradeIn,
    getTradeInDeviceFromStorage,
    getTradeInSuggestInputNotificationContent,
} from 'Helper/getTradeInHelpers';
import { CONTAINER_TRADE_IN } from 'Constant';
import mountFormSuggestInput, {
    resetTradeInFormSuggestInput,
    updateFormSuggestInputResults,
} from '../../components/FormSuggestInput';
import { isEqual } from 'lodash';
import {
    mountNotification,
    updateNotification,
} from '../../components/Notification';
import { toggleElementById } from 'Helper/domHelper';
import {
    initializeOverlay,
    mountTradeInButtonLink,
} from '../../components/ButtonLink';
import {
    selectDeviceId,
    selectIsTauschbonus,
    selectIsTradeIn,
    selectSalesChannel,
    selectIsTauschbonusEligible,
} from '../App/selectors';
import {
    selectActiveOffer,
    selectSubscriptionId,
} from '../Tariff/selectors';
import getTradeInItemSummaryCardProps from './helpers/getTradeInItemSummaryCardProps';
import { mountPromotionalCardById } from 'Component/PromotionalCard';
import { updateTauschbonus } from 'Helper/getTauschbonusHelpers';
import { getTotalTauschbonusAmount } from '@vfde-sails/page-options';
import { mountPromotionalCardList } from 'Helper/promotionalCardHelper';
import { getTradeInSuggestInputProps } from './helpers/getTradeInSuggestInputProps';
import { IFormSuggestInputProperties } from '@vfde-brix/ws10/form-suggest-input';
import formatAndSortTradeInResponse from './helpers/formatAndSortTradeInResponse';

function TradeIn (state: StateProps, actions: TradeInActionDispatchers) {
    const { setDefaultState, setIsTradeInSelected, getOverlayContent, setPromotionalSummaryCardOffer } = actions;

    injectSaga(CONTAINER_TRADE_IN, tradeInSaga);

    const isTradeIn = getIsTradeIn();

    const tradeInOptionPicker = mountTradeInOptionPicker(TRADEIN_OPTION_PICKER_CONTAINER_ID, setIsTradeInSelected, isTradeIn);
    tradeInOptionPicker?.toggleContainer(false, true);
    const tradeInSuggestInputProperties = getTradeInSuggestInputProps(actions);
    const tradeInSuggestInput = mountFormSuggestInput(TRADEIN_SUGGEST_INPUT_CONTAINER_ID, tradeInSuggestInputProperties as IFormSuggestInputProperties);
    const tradeInSuggestInputNotification = mountNotification(TRADEIN_STATUS_NOTIFICATION_CONTAINER_ID);
    const itemSummaryCard = mountItemSummaryCard(TRADEIN_ITEM_SUMMERY_CARD_CONTAINER_ID, { onDeleteButtonClick: () => actions.deleteSelectedTradeInDevice() });

    // Check for TradeInDeviceFromStorage and send the value to setDefaultState
    setDefaultState(isTradeIn, getTradeInDeviceFromStorage());
    const tradeInBtnLink = mountTradeInButtonLink(TRADE_IN_OVERLAY_BUTTON_LINK);
    const tauschBonusBtnLink = mountTradeInButtonLink(TAUSCHBONUS_OVERLAY_BUTTON_LINK);

    const tauschbonusPromotionalCard = mountPromotionalCardById(TAUSCHBONUS_PROMOTIONAL_CARD_CONTAINER_ID);

    return {
        getDerivedStateFromProps (newState: StateProps, oldState: StateProps) {
            const { subscriptionId, salesChannel, deviceId, offer } = newState;

            if (newState.selectedTradeInDevice) {
                // there is a selectedTradeInDevice
                if (!oldState.selectedTradeInDevice) {
                    // if a new device was selected, so we update itemSummaryCard
                    // and suggestInputNotification
                    // reset the formSuggestInput if the user removes the device again
                    tradeInSuggestInputNotification && updateNotification(getTradeInSuggestInputNotificationContent(newState), tradeInSuggestInputNotification, TRADEIN_STATUS_NOTIFICATION_CONTAINER_ID);
                    tradeInSuggestInput && resetTradeInFormSuggestInput(tradeInSuggestInput);
                }
            }
            else {
                // no selectedTradeInDevice
                if (newState.isLoading !== oldState.isLoading) {
                    tradeInSuggestInput?.toggleLoadingAnimation(newState.isLoading);
                }

                if (!isEqual(newState.devices, oldState.devices)) {
                    // device list has changed, so we update the formSuggestInput results
                    // and notification to remove potential earlier notifications
                    tradeInSuggestInput && updateFormSuggestInputResults(tradeInSuggestInput, formatAndSortTradeInResponse(newState.devices!));
                    tradeInSuggestInputNotification && updateNotification(getTradeInSuggestInputNotificationContent(newState), tradeInSuggestInputNotification, TRADEIN_STATUS_NOTIFICATION_CONTAINER_ID);
                }
                else if (newState.hasError !== oldState.hasError || newState.isDeviceNotFound !== oldState.isDeviceNotFound) {
                    // in this case the device-list stayed the same but the 'hasError' state or 'isDeviceNotFound' state changed
                    // so we update the notification only to show the current error or hide the notification if there is no error
                    tradeInSuggestInputNotification && updateNotification(getTradeInSuggestInputNotificationContent(newState), tradeInSuggestInputNotification, TRADEIN_STATUS_NOTIFICATION_CONTAINER_ID);
                }

                if (newState.isTradeInSelected) {
                    // if there is no selectedTradeInDevice but tradeIn picker is 'yes'
                    // show formSuggestInput and hide itemSummaryCard & buttonLinks
                    // so the user can type the device name
                    tradeInSuggestInput?.toggleContainer(false, true);
                    itemSummaryCard && itemSummaryCard?.toggleContainer(true, true);
                }
                else if (oldState.isTradeInSelected) {
                    // there is no selectedTradeInDevice and tradeIn picker switched from 'yes' to 'no'
                    // so we update notification so it becomes hidden
                    tradeInSuggestInputNotification && updateNotification(getTradeInSuggestInputNotificationContent(newState), tradeInSuggestInputNotification, TRADEIN_STATUS_NOTIFICATION_CONTAINER_ID);
                }
            }

            if (newState.isTradeInSelected && newState.selectedTradeInDevice) {
                // in this case tradeIn picker is 'yes' and selectedTradeInDevice is present
                // which means we must hide formSuggestInput and show itemSummaryCard & iconText
                // so the users is able to see his selected device and the tradeIn overlay link (icon-text)

                tradeInSuggestInput && (
                    tradeInSuggestInput?.toggleContainer(true, true),
                    resetTradeInFormSuggestInput(tradeInSuggestInput)
                );
                itemSummaryCard && updateItemSummaryCard(itemSummaryCard, getTradeInItemSummaryCardProps(newState));
                itemSummaryCard && itemSummaryCard?.toggleContainer(false, true);
            }
            else if (!newState.isTradeInSelected) {
                // in this case tradeIn picker is 'no'
                // but `newState.selectedTradeInDevice` could be set or not
                // (user deactivated tradeIn with a selected device)
                // so we hide formSuggestInput, itemSummaryCard and iconText
                tradeInSuggestInput && (
                    tradeInSuggestInput?.toggleContainer(true, true),
                    resetTradeInFormSuggestInput(tradeInSuggestInput)
                );
                itemSummaryCard && itemSummaryCard?.toggleContainer(true, true);
            }

            if ( newState.isTradeIn !== oldState.isTradeIn || newState.isTauschbonus !== oldState.isTauschbonus) {
                // mount tradein and tauschbonus overlay buttons
                const overlayButtonLink = newState.isTauschbonusEligible ? TAUSCHBONUS_OVERLAY_BUTTON_LINK : TRADE_IN_OVERLAY_BUTTON_LINK;
                const overlayType = newState.isTauschbonus ? TAUSCHBONUS_OVERLAY : TRADE_IN_OVERLAY;
                const btnLinkType = newState.isTauschbonus ? tauschBonusBtnLink : tradeInBtnLink;

                newState.isTradeIn && btnLinkType && initializeOverlay(
                    document.getElementById(overlayButtonLink),
                    getOverlayContent,
                    overlayType,
                );
                toggleElementById(overlayButtonLink, !newState.isTradeIn);

                // mount tradein promotional card
                deviceId && salesChannel && subscriptionId && mountPromotionalCardList( deviceId, salesChannel, subscriptionId, offer, setPromotionalSummaryCardOffer, getOverlayContent, newState.isTauschbonus, newState.isTradeIn);
            }

            if ( newState.isTauschbonusEligible !== oldState.isTauschbonusEligible && newState.isTauschbonusEligible) {
                const tauschbonusValue = getTotalTauschbonusAmount(deviceId!);

                if (tauschbonusValue && tauschbonusPromotionalCard) {
                    // display tauschbonus promotional card
                    tauschbonusPromotionalCard.toggleContainer(false, true, false);
                    // update tauschbonus promotional card when get tauschbonus total value
                    updateTauschbonus(tauschbonusPromotionalCard, tauschbonusValue);
                }
            }
        },
    };
}

const mapStateToProps = createStructuredSelector<RootState<IInitialStateTradeIn & IInitialStateTariff & IInitialStateOptions & IInitialStateApp>, StateProps>({
    isLoading: selectIsLoading(),
    hasError: selectHasError(),
    isTradeInSelected: selectIsTradeInSelected(),
    suggestInputValue: selectTradeInInputValue(),
    selectedTradeInDevice: selectSelectedTradeInDevice(),
    devices: selectTradeInDevices(),
    isDeviceNotFound: selectIsDeviceNotFound(),
    subscriptionId: selectSubscriptionId(),
    salesChannel: selectSalesChannel(),
    deviceId: selectDeviceId(),
    offer: selectActiveOffer(),
    isTradeIn: selectIsTradeIn(),
    isTauschbonus: selectIsTauschbonus(),
    isTauschbonusEligible: selectIsTauschbonusEligible(),
});

const mountTradeInContainer = connect(mapStateToProps, tradeInActionDispatchers)(TradeIn);

export default mountTradeInContainer;
