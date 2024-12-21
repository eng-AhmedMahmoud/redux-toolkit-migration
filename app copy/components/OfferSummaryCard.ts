import { OFFER_SUMMARY_CARD_FOOTER_LINK_OVERLAY_CONTAINER_ID } from '../container/App/constants';
import {
    getLegalText,
    getStairwayText,
    getHighlightBadgeFromAdditionalPageOptions,
    createTooltipId,
    getHeadline,
    getSubline,
} from 'Helper/offerSummaryCardHelpers';
import {
    getIsSimonlyEligible,
    getIsRedplusEligible,
} from 'Helper/getUserDataHelper';
import { ADDITIONAL_PAGE_OPTIONS } from '@vfde-sails/constants';
import {
    initializeOverlayOpenEvent,
    mountOverlay,
} from './Overlay';
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
import { StateProps } from 'app/container/Tariff/interface';
import { getShippingFee } from '@vfde-sails/page-options';
import {
    OfferType,
    PriceType,
} from '@vfde-sails/glados-v2';
import { AppActionDispatchers } from 'app/container/App/slice';
import { mountStickyPriceBar } from './StickyPriceBar';
import { IStickyPriceBarItem } from '@vfde-brix/ws10/sticky-price-bar';

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

    return offerSummaryCard;
};

/**
 * Call different update functions with the new state
 * @param offerSummaryCard OfferSummaryCard component
 * @param newState new state
 * @param actions actions
 */
export const updateOfferSummaryCard = (
    offerSummaryCard: OfferSummaryCard | null,
    newState: StateProps,
    actions: AppActionDispatchers,
    // overlayCallbacks: Parameters<typeof initEditorialOverlays>[1],
) => {
    /* istanbul ignore if */
    if (!offerSummaryCard || !newState.deviceId) {
        return;
    }

    updateHighlightBadge(offerSummaryCard, newState);
    updateHeadline(offerSummaryCard, newState);
    updatePrices(offerSummaryCard, newState);
    updateButtons(offerSummaryCard, actions);
    updateTexts(offerSummaryCard, newState, actions.getOverlayContent);
};

/**
 * Update Highlight badge
 * @param offerSummaryCard OfferSummaryCard component
 * @param newState new state
 */
const updateHighlightBadge = (offerSummaryCard: OfferSummaryCard, newState: StateProps): void => {
    const { subscriptionId } = newState;
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
        containerTooltip = {
            stdTooltipId: createTooltipId(newState),
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
 * @param newState new state
 */
const updateHeadline = (
    offerSummaryCard: OfferSummaryCard,
    newState: StateProps,
) => {
    offerSummaryCard.updateHeadline({
        stdContent: getHeadline(newState.deviceName!),
    });
};

/**
 * The order of prices within the OfferSummaryCard should be:
 * - OneTimePrice (PromoPrice)
 * - MonthlyPrice (PromoPrice)
 * - Stairway (AdditionalPrice)
 * - ShippingFee (AdditionalPrice)
 * @param offerSummaryCard The offerSummaryCard instance
 * @param newState new state
 */
const updatePrices = (
    offerSummaryCard: OfferSummaryCard,
    newState: StateProps,
) => {
    const originalProperties = offerSummaryCard.getOriginalProperties();
    const { offer, priceToPay } = newState;
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

        promoPrices.push({
            txtLabel: monthlyPriceLabel,
            containerPromoPrice: {
                ...originalProperties.containerPromoPrices![1].containerPromoPrice,
                strikePrice: newState.strikePrice ? Price.fromNumber(newState.strikePrice.gross) : undefined,
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
    const { hasStairway } = newState;

    if (hasStairway) {
        const stairwayPrice = Price.fromNumber(newState.endPriceToPay!.gross);

        additionalPrices.push({
            txtLabel: getStairwayText(newState)!,
            price: stairwayPrice,
        });

        stickyPriceBarItems.push({
            stdText: getStairwayText(newState)!,
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
 * @param actions actions
 */
const updateButtons = (
    offerSummaryCard: OfferSummaryCard,
    actions: AppActionDispatchers,
) => {
    const originalProperties = offerSummaryCard.getOriginalProperties();
    const buttons: IButtonProperties[] = [];

    const basketButtonProps: IButtonProperties = {
        ...originalProperties.containerButtons![0],
        business: {
            onClick: actions.goToBasket,
        },
    };

    buttons.push(basketButtonProps);

    const familyCardLinkButtonProps: IButtonProperties = {
        ...originalProperties.containerButtons![1],
        business: {
            onClick: actions.goToFamilyCard,
        },
    };

    getIsRedplusEligible() && buttons.push(familyCardLinkButtonProps);

    offerSummaryCard.updateButtons(buttons);
};

/**
 * Updates the text properties
 * @param offerSummaryCard The offerSummaryCard instance
 * @param newState new state
 * @param getOverlayContentAction get overlay content action
 */
const updateTexts = (
    offerSummaryCard: OfferSummaryCard,
    newState: StateProps,
    getOverlayContentAction: AppActionDispatchers['getOverlayContent'],
) => {
    const isSimonlyEligible = getIsSimonlyEligible();
    const subline = getSubline(newState);
    const legalText = getLegalText(newState);
    const { simOnlyFooterLink: additionalText } = window[ADDITIONAL_PAGE_OPTIONS].offerSummaryCard;
    const additionalTextElement = document.getElementsByClassName(OFFER_SUMMARY_CARD_ADDITIONAL_TEXT_CLASSNAME)[0];
    const additionalTextLinkElement = additionalTextElement && additionalTextElement.getElementsByTagName('a')[0] as HTMLAnchorElement;

    if (!isSimonlyEligible) {
        const overlay = mountOverlay(OFFER_SUMMARY_CARD_FOOTER_LINK_OVERLAY_CONTAINER_ID);
        additionalTextElement && initializeOverlayOpenEvent(overlay, additionalTextLinkElement, getOverlayContentAction);
    }
    else {
        offerSummaryCard.updateAdditionalText([additionalText]);
    }

    offerSummaryCard.updateSubline(subline);
    offerSummaryCard.updateLegalText(legalText);
};
