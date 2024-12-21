import { getGigakombiNotificationProperties } from './../../helpers/gigaKombiNotificationHelper';
import {
    connect,
    injectReducer,
    injectSaga,
    RootState,
} from '@vfde-sails/core';
import './style.scss';
import { CONTAINER_OVERLAY } from 'Constant';
import { createStructuredSelector } from 'reselect';
import {
    IInitialState as IInitialStateTariff,
    StateProps,
} from './interface';
import tariffSaga from './saga';
import {
    mountUnorderedHorizontalList,
    updateUnorderedHorizontalList,
} from '../../components/UnorderedHorizontalList';
import {
    TARIFF_OPTION_PICKER_CONTAINER_ID,
    OFFER_SUMMARY_CARD_CONTAINER_ID,
    TARIFF_INFO_CONTAINER_ID,
    PROMOTIONAL_SUMMARY_CARD_CONTAINER_ID,
    PROMOTIONAL_SUMMARY_CARD_SAVED_AMOUNT,
    MEDIA_TEXT_CARD,
    STICKY_PRICE_BAR_CONTAINER_ID,
} from './constants';
import {
    selectActiveOffer,
    selectActiveOffers,
    selectDataVolume,
    selectEndDataVolume,
    selectEndPriceToPay,
    selectEndTariffPrice,
    selectPromotionalSummaryCardOffer,
    selectPriceToPay,
    selectStairway,
    selectStrikePrice,
    selectSubscriptionId,
    selectSubscriptionPayload,
    selectTariffPrice,
} from './selectors';
import {
    mountTariffOptionPicker,
    convertTariffsFromApiToTariffOptionPickerItems,
} from '../../components/TariffOptionPicker';
import { mountOverlay } from '../../components/Overlay';
import {
    CONTAINER_GIGAKOMBI_NOTIFICATION,
    GIGAKOMBI_CONSUMER_BUTTON_LINK,
    GIGAKOMBI_YOUNG_BUTTON_LINK,
    OVERLAY_CONTAINER_ID,
} from '../App/constants';
import {
    selectDeviceId,
    selectIsRedplusEligible,
    selectIsTauschbonus,
    selectIsTradeIn,
    selectSalesChannel,
} from '../App/selectors';
import overlaySaga from '../Overlay/saga';
import {
    GIGAKOMBI_IP,
    GIGAKOMBI_TV,
    GigakombiType,
    SalesChannel,
    YOUNG_S_VIRTUAL_ID,
} from '@vfde-sails/constants';
import { IInitialState as IInitialStateApp } from '../App/interfaces/state';
import { IInitialState as IInitialStateOptions } from '../Options/interface';
import {
    mountOfferSummaryCard,
    updateOfferSummaryCard,
} from '../../components/OfferSummaryCard';
import {
    selectAtomicId,
    selectDeviceName,
} from '../Options/selectors';
import {
    getGigakombiType,
    getIsGigakombiEligible,
} from 'Helper/getUserDataHelper';
import {
    toggleElementById,
    toggleTariffOverlayButtonLink,
} from '../../helpers/domHelper';
import {
    getPromotionalSummaryCardInfo,
    togglePromotionalSummaryCardChildren,
} from './helpers/promotionalSummaryCardHelpers';
import {
    mountIconText,
    updateIconText,
} from '../../components/IconText';
import tariffSlice, {
    tariffActionDispatchers,
    TariffActionDispatchers,
} from './slice';
import {
    mountNotification,
    updateNotification,
} from '../../components/Notification';
import { getGigakombiNotificationText } from 'Helper/gigaKombiNotificationHelper';
import { getTariffOverlayButtonLink } from './helpers/getTariffOverlayButtonLink';
import {
    hasExtraGb as checkHasExtraGb,
    getGigakombiDiscountSocs,
} from '@vfde-sails/page-options';
import { mountPromotionalCardList } from 'Helper/promotionalCardHelper';

function Tariff (state: StateProps, actions: TariffActionDispatchers) {
    const { setDefaultState, setSubscriptionId, getOverlayContent, setPromotionalSummaryCardOffer } = actions;

    injectReducer(tariffSlice.name, tariffSlice.reducer);
    injectSaga(tariffSlice.name, tariffSaga);
    injectSaga(CONTAINER_OVERLAY, overlaySaga);
    setDefaultState();
    mountOverlay(OVERLAY_CONTAINER_ID);

    const gigakombiNotification = mountNotification(CONTAINER_GIGAKOMBI_NOTIFICATION);
    const offerSummaryCard = mountOfferSummaryCard(OFFER_SUMMARY_CARD_CONTAINER_ID, STICKY_PRICE_BAR_CONTAINER_ID);
    const unorderedHorizontalList = mountUnorderedHorizontalList(TARIFF_INFO_CONTAINER_ID);
    const tariffOptionPicker = mountTariffOptionPicker(TARIFF_OPTION_PICKER_CONTAINER_ID, setSubscriptionId);

    const isGigakombiEligible = getIsGigakombiEligible();
    const promotionalSummaryCardSavedAmount = mountIconText(
        PROMOTIONAL_SUMMARY_CARD_SAVED_AMOUNT,
    );
    const gigakombiType = getGigakombiType();

    return {
        getDerivedStateFromProps (newState: StateProps, oldState: StateProps) {
            const { subscriptionId, salesChannel, deviceId, offer, promotionalSummaryCardOffer, isTauschbonus, isTradeIn } = newState;
            const isGigaKombiTv = gigakombiType === GIGAKOMBI_TV;
            const isGigaKombiIp = gigakombiType === GIGAKOMBI_IP;
            const isGigaKombiTvOrNotEligible = !isGigakombiEligible || isGigaKombiTv;

            getTariffOverlayButtonLink(getOverlayContent);

            if (subscriptionId !== oldState.subscriptionId) {
                newState.subscriptionId && updateUnorderedHorizontalList(unorderedHorizontalList, newState.subscriptionId);

                deviceId && salesChannel && subscriptionId && mountPromotionalCardList( deviceId, salesChannel, subscriptionId, offer, setPromotionalSummaryCardOffer, getOverlayContent, isTauschbonus, isTradeIn);
            }

            if (promotionalSummaryCardOffer.offerPrice && subscriptionId !== oldState.subscriptionId
                || promotionalSummaryCardOffer.offerPrice !== oldState.promotionalSummaryCardOffer.offerPrice) {
                toggleElementById(PROMOTIONAL_SUMMARY_CARD_CONTAINER_ID, false);
                toggleElementById(MEDIA_TEXT_CARD, false);
                const hasExtraGb = checkHasExtraGb(salesChannel as SalesChannel, gigakombiType as GigakombiType);
                const gigakombiSocs: string[] = getGigakombiDiscountSocs(salesChannel!, undefined, gigakombiType!);
                togglePromotionalSummaryCardChildren(subscriptionId, hasExtraGb, offer?.discount, gigakombiSocs);

                if (subscriptionId !== YOUNG_S_VIRTUAL_ID) {
                    const savedAmountTxt = getPromotionalSummaryCardInfo(promotionalSummaryCardOffer);
                    updateIconText(promotionalSummaryCardSavedAmount, savedAmountTxt);
                }
            }

            toggleElementById(PROMOTIONAL_SUMMARY_CARD_CONTAINER_ID, isGigaKombiTvOrNotEligible);

            if (isGigaKombiTvOrNotEligible) {
                toggleElementById(GIGAKOMBI_CONSUMER_BUTTON_LINK, true);
                toggleElementById(GIGAKOMBI_YOUNG_BUTTON_LINK, true);
            }
            else {
                salesChannel && toggleTariffOverlayButtonLink(salesChannel);
            }

            if (isGigakombiEligible || !isGigaKombiIp) {
                toggleElementById(CONTAINER_GIGAKOMBI_NOTIFICATION, false);
                const gigaKombiNotificationTxt = getGigakombiNotificationText(gigakombiType!);
                const gigaKombiNotificationProps = getGigakombiNotificationProperties(gigaKombiNotificationTxt!, gigakombiType!);
                updateNotification(gigaKombiNotificationProps, gigakombiNotification!, CONTAINER_GIGAKOMBI_NOTIFICATION);
            }

            if (salesChannel !== oldState.salesChannel) {
                deviceId && salesChannel && subscriptionId && mountPromotionalCardList( deviceId, salesChannel, subscriptionId, offer, setPromotionalSummaryCardOffer, getOverlayContent, isTauschbonus, isTradeIn);
            }

            if (offer && (offer !== oldState.offer || subscriptionId !== oldState.subscriptionId)) {
                tariffOptionPicker?.update({
                    items: convertTariffsFromApiToTariffOptionPickerItems(newState),
                });

                offerSummaryCard && updateOfferSummaryCard(offerSummaryCard, newState, actions);
                deviceId && salesChannel && subscriptionId && mountPromotionalCardList( deviceId, salesChannel, subscriptionId, offer, setPromotionalSummaryCardOffer, getOverlayContent, isTauschbonus, isTradeIn);
            }
        },
    };
}

const mapStateToProps = createStructuredSelector<
    RootState<IInitialStateTariff & IInitialStateApp & IInitialStateOptions>,
    StateProps
>({
    subscriptionId: selectSubscriptionId(),
    salesChannel: selectSalesChannel(),
    offer: selectActiveOffer(),
    dataVolume: selectDataVolume(),
    deviceId: selectDeviceId(),
    priceToPay: selectPriceToPay(),
    strikePrice: selectStrikePrice(),
    tariffPrice: selectTariffPrice(),
    endTariffPrice: selectEndTariffPrice(),
    endDataVolume: selectEndDataVolume(),
    hasStairway: selectStairway(),
    endPriceToPay: selectEndPriceToPay(),
    isRedplusEligible: selectIsRedplusEligible(),
    subscriptionPayload: selectSubscriptionPayload(),
    atomicId: selectAtomicId(),
    offers: selectActiveOffers(),
    deviceName: selectDeviceName(),
    promotionalSummaryCardOffer: selectPromotionalSummaryCardOffer(),
    isTradeIn: selectIsTradeIn(),
    isTauschbonus: selectIsTauschbonus(),

});

const mountTariffContainer = connect(
    mapStateToProps,
    tariffActionDispatchers,
)(Tariff);

export default mountTariffContainer;
