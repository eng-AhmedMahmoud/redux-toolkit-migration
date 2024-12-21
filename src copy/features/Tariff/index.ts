import { useAppDispatch } from '../../app/store';
import { mountOverlay } from '../../components/Overlay';
import { mountGigakombiNotification } from './components/GigaKobmiNotification';
import { mountUnorderedHorizontalList } from './components/UnorderedHorizontalList';
import {
    OFFER_SUMMARY_CARD_CONTAINER_ID,
    PROMOTIONAL_SUMMARY_CARD_CONTAINER_ID,
    PROMOTIONAL_SUMMARY_CARD_SAVED_AMOUNT,
    STICKY_PRICE_BAR_CONTAINER_ID,
    TARIFF_INFO_CONTAINER_ID,
    TARIFF_OPTION_PICKER_CONTAINER_ID,
} from './constants';
import { mountTariffOverlayButtonLinks } from './components/TariffOverlayButtonLinks';
import { startListeners } from './listeners';
import { setDefaultState } from './slice';
import {
    CONTAINER_GIGAKOMBI_NOTIFICATION,
    OVERLAY_CONTAINER_ID,
} from '../App/constants';
import { mountPromotionalCards } from './components/PromotionalCards';
import { mountOfferSummaryCard } from './components/OfferSummaryCard';
import { mountTariffOptionPicker } from './components/TariffOptionPicker';
import { mountPromotionalSummaryCardOffer } from './components/PromotionalSummaryCardOffer';
import { mountPromotionalSummaryCardSavedAmount } from './components/PromotionalSummaryCardSavedAmount';
import './style.scss';

/**
 * init tariff feature
 */
const initTariff = () => {
    startListeners();

    const dispatch = useAppDispatch();

    mountOverlay(OVERLAY_CONTAINER_ID);
    mountGigakombiNotification(CONTAINER_GIGAKOMBI_NOTIFICATION);
    mountUnorderedHorizontalList(TARIFF_INFO_CONTAINER_ID);
    mountTariffOverlayButtonLinks();
    mountPromotionalCards();
    mountTariffOptionPicker(TARIFF_OPTION_PICKER_CONTAINER_ID);
    mountOfferSummaryCard(OFFER_SUMMARY_CARD_CONTAINER_ID, STICKY_PRICE_BAR_CONTAINER_ID);
    mountPromotionalSummaryCardOffer(PROMOTIONAL_SUMMARY_CARD_CONTAINER_ID);
    mountPromotionalSummaryCardSavedAmount(PROMOTIONAL_SUMMARY_CARD_SAVED_AMOUNT);

    dispatch(setDefaultState());
};

export default initTariff;
