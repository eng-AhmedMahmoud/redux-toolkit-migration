import { OFFER_SUMMARY_CARD_FOOTER_LINK_OVERLAY_CONTAINER_ID } from '../../App/constants';
import {
    getLegalText,
    getStairwayText,
    getHighlightBadgeFromAdditionalPageOptions,
    createTooltipId,
    getHeadline,
    getSubline,
    handleGoToBasketDispatch,
    handleGoToFamilyCardDispatch,
} from '../../../helpers/offerSummaryCardHelpers';
import {
    getIsSimonlyEligible,
    getIsRedplusEligible,
} from '../../../helpers/getUserDataHelper';
import { ADDITIONAL_PAGE_OPTIONS } from '@vfde-sails/constants';
import {
    initializeOverlayOpenEvent,
    mountOverlay,
} from '../../../components/Overlay';
import {
    createOfferSummaryCard,
    OfferSummaryCard,
    OFFER_SUMMARY_CARD_ADDITIONAL_TEXT_CLASSNAME,
    IOfferSummaryCardPromoPrice,
    IOfferSummaryCardAdditionalPrice,
} from '@vfde-brix/ws10/offer-summary-card';
import {
    NO_PATTERN_BUSINESS_LOGIC,
    Price,
    stripHtml,
} from '@vfde-brix/ws10/core';
import { IHighlightBadgeProperties } from '@vfde-brix/ws10/highlight-badge';
import { ITooltipProperties } from '@vfde-brix/ws10/tooltip';
import { IButtonProperties } from '@vfde-brix/ws10/button';
import { getShippingFee } from '@vfde-sails/page-options';
import {
    OfferType,
    PriceType,
} from '@vfde-sails/glados-v2';
import { mountStickyPriceBar } from './StickyPriceBar';
import { IStickyPriceBarItem } from '@vfde-brix/ws10/sticky-price-bar';
import { RootState } from '../../../app/store';
import { selectDeviceId } from '../../App/selectors';
import {
    selectActiveOffer,
    selectEndPriceToPay,
    selectPriceToPay,
    selectStairway,
    selectStrikePrice,
    selectSubscriptionId,
} from '../selectors';
import { selectDeviceName } from '../../Options/selectors';
import { startAppListening } from '../../../app/listener';

/**
 * Mount Offer Summary Card
 * @param containerId OfferSummaryCard container Id
 * @param stickyPriceBarContainerId Sticky Price Bar containerId
 */
export const mountOfferSummaryCard = (
    containerId: string,
    stickyPriceBarContainerId: string,
): OfferSummaryCard | null => {
    const container = document.getElementById(containerId);

    /* istanbul ignore if */
    if (!container) {
        return null;
    }

    const offerSummaryCard = createOfferSummaryCard(container, NO_PATTERN_BUSINESS_LOGIC);
    const stickyPriceBar = mountStickyPriceBar(stickyPriceBarContainerId);

    // connect offerSummaryCard with stickyPriceBar
    stickyPriceBar && offerSummaryCard.connectStickyPriceBar(stickyPriceBar);

    listenForUpdates(offerSummaryCard);

    return offerSummaryCard;
};

const listenForUpdates = (offerSummaryCard: OfferSummaryCard) => {
    startAppListening({
        predicate: (_action, currentState, previousState) => {
            const subscriptionIdChanged = selectSubscriptionId(currentState) !== selectSubscriptionId(previousState);
            const activeOfferChanged = selectActiveOffer(currentState) !== selectActiveOffer(previousState);

            return (selectActiveOffer(currentState) !== null && (activeOfferChanged || subscriptionIdChanged));
        },
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            offerSummaryCard && updateOfferSummaryCard(offerSummaryCard, state);
        },
    });
};

/**
 * Call different update functions with the new state
 * @param offerSummaryCard OfferSummaryCard component
 * @param state state
 */
const updateOfferSummaryCard = (
    offerSummaryCard: OfferSummaryCard | null,
    state: RootState,
    // overlayCallbacks: Parameters<typeof initEditorialOverlays>[1],
) => {
    const deviceId = selectDeviceId(state);

    /* istanbul ignore if */
    if (!offerSummaryCard || !deviceId) {
        return;
    }

    updateHighlightBadge(offerSummaryCard, state);
    updateHeadline(offerSummaryCard, state);
    updatePrices(offerSummaryCard, state);
    updateButtons(offerSummaryCard);
    updateTexts(offerSummaryCard, state);
};

/**
 * Update Highlight badge
 * @param offerSummaryCard OfferSummaryCard component
 * @param state state
 */
const updateHighlightBadge = (offerSummaryCard: OfferSummaryCard, state: RootState): void => {
    const subscriptionId = selectSubscriptionId(state);
    const highlightBadgeFromAdditionalPageOptions = subscriptionId && getHighlightBadgeFromAdditionalPageOptions(subscriptionId);

    if (!highlightBadgeFromAdditionalPageOptions) {
        offerSummaryCard.toggleHighlightBadgeContainer(false);

        return;
    }

    const { text, tooltip, icon, color } = highlightBadgeFromAdditionalPageOptions;
    let containerTooltip: ITooltipProperties | undefined;

    const props: Partial<IHighlightBadgeProperties> = {
        txtContent: text,
        optColor: color,
    };

    if (tooltip) {
        const offer = selectActiveOffer(state);
        containerTooltip = {
            stdTooltipId: createTooltipId(offer!),
            stdHeadline: tooltip.headline,
            txtContent: `<p>${tooltip.text}</p>`,
            business: NO_PATTERN_BUSINESS_LOGIC,
        };
    }

    if (typeof containerTooltip !== 'undefined') {
        props.containerTooltip = containerTooltip;
    }

    if (icon) {
        props.stdIcon = icon;
    }

    offerSummaryCard.updateHighlightBadge({ ...props });
    offerSummaryCard.toggleHighlightBadgeContainer(true);
    // Initialize simplicity footnotes
    (window as any).vf.footnotes.init();
};

/**
 * Update Headline
 * @param offerSummaryCard OfferSummaryCard component
 * @param state state
 */
const updateHeadline = (
    offerSummaryCard: OfferSummaryCard,
    state: RootState,
) => {
    const deviceName = selectDeviceName(state);

    offerSummaryCard.updateHeadline({
        stdContent: getHeadline(deviceName!),
    });
};

/**
 * The order of prices within the OfferSummaryCard should be:
 * - OneTimePrice (PromoPrice)
 * - MonthlyPrice (PromoPrice)
 * - Stairway (AdditionalPrice)
 * - ShippingFee (AdditionalPrice)
 * @param offerSummaryCard The offerSummaryCard instance
 * @param state state
 */
const updatePrices = (
    offerSummaryCard: OfferSummaryCard,
    state: RootState,
) => {
    const originalProperties = offerSummaryCard.getOriginalProperties();

    const offer = selectActiveOffer(state);
    const priceToPay = selectPriceToPay(state);

    const oneTimePrice = offer?.prices[OfferType.Composition][OfferType.HardwareOnly][PriceType.Onetime].withoutDiscounts.gross;
    const stickyPriceBarItems: IStickyPriceBarItem[] = [];

    // #region 1. OneTimePrice

    const oneTimePriceLabel = originalProperties.containerPromoPrices![0].txtLabel;

    const promoPrices: IOfferSummaryCardPromoPrice[] = [
        {
            txtLabel: oneTimePriceLabel,
            containerPromoPrice: {
                ...originalProperties.containerPromoPrices![0].containerPromoPrice,
                price: Price.fromNumber(oneTimePrice!),
            },
        },
    ];

    stickyPriceBarItems.push({
        stdText: stripHtml(oneTimePriceLabel),
        price: Price.fromNumber(oneTimePrice!),
    });

    // #endregion

    // #region 2. MonthlyPrice

    if (priceToPay) {
        // priceToPay could temporarily be null when the tariff API request is still loading
        const monthlyPriceLabel = originalProperties.containerPromoPrices![1].txtLabel;
        const monthlyPrice = Price.fromNumber(priceToPay.gross);

        const strikePrice = selectStrikePrice(state);

        promoPrices.push({
            txtLabel: monthlyPriceLabel,
            containerPromoPrice: {
                ...originalProperties.containerPromoPrices![1].containerPromoPrice,
                strikePrice: strikePrice ? Price.fromNumber(strikePrice.gross) : undefined,
                price: monthlyPrice,
            },
        });

        stickyPriceBarItems.push({
            stdText: stripHtml(monthlyPriceLabel),
            price: monthlyPrice,
        });
    }

    // #endregion

    // #region 3. Stairway

    const additionalPrices: IOfferSummaryCardAdditionalPrice[] = [];
    const hasStairway = selectStairway(state);

    if (hasStairway) {
        const endPriceToPay = selectEndPriceToPay(state);
        const stairwayPrice = Price.fromNumber(endPriceToPay!.gross);

        additionalPrices.push({
            txtLabel: getStairwayText(state)!,
            price: stairwayPrice,
        });

        stickyPriceBarItems.push({
            stdText: getStairwayText(state)!,
            price: stairwayPrice,
        });
    }

    // #endregion

    // #region 4. ShippingFee

    const shippingFee = getShippingFee();

    if (shippingFee) {
        additionalPrices.push(
            {
                txtLabel: shippingFee.label,
                price: Price.fromNumber(shippingFee.gross),
            },
        );
    }

    offerSummaryCard.updatePrices(
        promoPrices,
        additionalPrices,
    );

    offerSummaryCard.stickyPriceBar?.update({ stickyPriceBarItems });

    // #endregion
};

/**
 * Update Buttons
 * @param offerSummaryCard OfferSummaryCard component
 */
const updateButtons = (
    offerSummaryCard: OfferSummaryCard,
) => {
    const originalProperties = offerSummaryCard.getOriginalProperties();
    const buttons: IButtonProperties[] = [];

    const basketButtonProps: IButtonProperties = {
        ...originalProperties.containerButtons![0],
        business: {
            onClick: handleGoToBasketDispatch,
        },
    };

    buttons.push(basketButtonProps);

    const familyCardLinkButtonProps: IButtonProperties = {
        ...originalProperties.containerButtons![1],
        business: {
            onClick: handleGoToFamilyCardDispatch,
        },
    };

    getIsRedplusEligible() && buttons.push(familyCardLinkButtonProps);

    offerSummaryCard.updateButtons(buttons);
};

/**
 * Updates the text properties
 * @param offerSummaryCard The offerSummaryCard instance
 * @param state state
 */
const updateTexts = (
    offerSummaryCard: OfferSummaryCard,
    state: RootState,
) => {
    const isSimonlyEligible = getIsSimonlyEligible();
    const subline = getSubline(state);
    const legalText = getLegalText(state);
    const { simOnlyFooterLink: additionalText } = window[ADDITIONAL_PAGE_OPTIONS].offerSummaryCard;
    const additionalTextElement = document.getElementsByClassName(OFFER_SUMMARY_CARD_ADDITIONAL_TEXT_CLASSNAME)[0];
    const additionalTextLinkElement = additionalTextElement && additionalTextElement.getElementsByTagName('a')[0] as HTMLAnchorElement;

    if (!isSimonlyEligible) {
        const overlay = mountOverlay(OFFER_SUMMARY_CARD_FOOTER_LINK_OVERLAY_CONTAINER_ID);
        additionalTextElement && initializeOverlayOpenEvent(overlay, additionalTextLinkElement);
    }
    else {
        offerSummaryCard.updateAdditionalText([additionalText]);
    }

    offerSummaryCard.updateSubline(subline);
    offerSummaryCard.updateLegalText(legalText);
};
