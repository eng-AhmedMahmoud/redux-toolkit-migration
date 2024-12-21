import { ADDITIONAL_PAGE_OPTIONS } from '@vfde-sails/constants';
import replaceCMSPlaceholder from './replaceCMSPlaceholder';
import {
    getOneTimePriceWithOrWithoutDiscounts,
    OfferType,
    PriceType,
    TariffWithHardwareOffer,
} from '@vfde-sails/glados-v2';
import {
    RootState,
    useAppDispatch,
} from '../app/store';
import {
    selectActiveOffer,
    selectDataVolume,
    selectPriceToPay,
    selectStairway,
} from '../features/Tariff/selectors';
import {
    goToBasket,
    goToFamilyCard,
} from '../features/App/slice';

/**
 * Get Highlight Badge From AdditionalPageOption
 */
export const getHighlightBadgeFromAdditionalPageOptions = (subscriptionId: string): any => {
    const { offerSummaryCard } = (window as any).additionalPageOptions;
    const { highlightBadges } = offerSummaryCard;

    return highlightBadges[subscriptionId] || undefined;
};

/**
 * Get Subline
 */
export const getSubline = (state: RootState): string[] | null => {
    const { tariffInfoPattern } = window[ADDITIONAL_PAGE_OPTIONS].offerSummaryCard;
    const offer = selectActiveOffer(state);
    const dataVolume = selectDataVolume(state);

    if (!offer || !dataVolume) {
        return null;
    }

    let tariffInfoText = replaceCMSPlaceholder(tariffInfoPattern, {
        name: offer?.tariffName,
        amount: dataVolume.unlimited ? 'unbegrenzten GB' : `${dataVolume.value.toLocaleString('de')} ${dataVolume.unit}`,
    });

    if (dataVolume.unlimited) {
        tariffInfoText = tariffInfoText.split('&')[0].trim();
    }

    return [tariffInfoText];
};

/**
 * Get Headline
 */
export const getHeadline = (deviceName: string): string => {
    const { deviceInfoPattern } = window[ADDITIONAL_PAGE_OPTIONS].offerSummaryCard;

    const deviceInfoText = replaceCMSPlaceholder(deviceInfoPattern, {
        deviceName,
    });

    return deviceInfoText;
};

/**
 * get legal text
 */
export const getLegalText = (state: RootState): string[] | null => {
    const { legalTextPattern, noOneTimeFeeText } = window[ADDITIONAL_PAGE_OPTIONS].offerSummaryCard;
    const offer = selectActiveOffer(state);

    if (!offer) {
        return null;
    }

    const connectionPrice = offer.prices[OfferType.Composition][OfferType.SimOnly][PriceType.Onetime];
    const connectionPriceRespectingDiscounts = connectionPrice && getOneTimePriceWithOrWithoutDiscounts(
        connectionPrice.withoutDiscounts,
        connectionPrice?.withDiscounts,
    );
    const hasConnectionPrice = !!connectionPriceRespectingDiscounts && connectionPriceRespectingDiscounts.gross > 0;

    if (hasConnectionPrice) {
        return [replaceCMSPlaceholder(legalTextPattern, {
            oneTimeFee: connectionPriceRespectingDiscounts.gross.toLocaleString('de'),
        })];
    }

    return [noOneTimeFeeText];
};

/**
 * get stairway text
 */
export const getStairwayText = (state: RootState): string | null => {

    const offer = selectActiveOffer(state);
    const hasStairway = selectStairway(state);
    const priceToPay = selectPriceToPay(state);

    const { stairwayTextPattern } = window[ADDITIONAL_PAGE_OPTIONS].offerSummaryCard;

    if (!offer || !hasStairway || !stairwayTextPattern) {
        return null;
    }

    return replaceCMSPlaceholder(stairwayTextPattern, {
        month: `${priceToPay!.recurrenceEnd + 1}`,
    });
};

/**
 * create tooltip id for highlight badge tooltip
 */
export const createTooltipId = (offer: TariffWithHardwareOffer): string => {
    let id = 'highlight-badge-tooltip-';
    id = id.concat((offer!.virtualItemId!).toString());

    return id;
};

/**
 * handle dispatch goToBasket action
 */
export const handleGoToBasketDispatch = () => {
    const dispatch = useAppDispatch();
    dispatch(goToBasket());
};

/**
 * handle dispatch goToFamilyCard action
 */
export const handleGoToFamilyCardDispatch = () => {
    const dispatch = useAppDispatch();
    dispatch(goToFamilyCard());
};
