import { PROMOTIONAL_CARD_OVERLAY_CONTAINER_ID_PREFIX } from './../container/Tariff/constants';
import {
    PROMOTIONAL_CARD_CHECKBOX_GROUP_NAME,
    PROMOTIONAL_CARD_CHECKBOX_ID,
    PROMOTIONAL_CARD_CONTAINER_ID,
    PROMOTIONAL_CARD_WRAPPER_ID,
} from '../../app/container/Tariff/constants';
import { IPromotionalCardProperties } from '@vfde-brix/ws10/promotional-card';
import { IFormSelectionControlProperties } from '@vfde-brix/ws10/form-selection-control';
import { NO_PATTERN_BUSINESS_LOGIC } from '@vfde-brix/ws10/core';
import { PromotionalCardProps } from '../../app/container/Tariff/interface';
import { mountPromotionalCardById } from 'Component/PromotionalCard';
import {
    GIGAKOMBI_TV,
    SalesChannel,
} from '@vfde-sails/constants';
import { TariffWithHardwareOffer } from '@vfde-sails/glados-v2';
import { getGigakombiType } from 'Helper/getUserDataHelper';
import {
    getGigakombiDiscountSocs,
    hasExtraGb,
} from '@vfde-sails/page-options';
import {
    getGigaKombiOfferPrice,
    getGigaKombiPromotionCardProperties,
} from './gigaKombiPromotionalCardHelper';
import { TariffActionDispatchers } from 'Container/Tariff/slice';
import { getTradeInPromotionCardProperties } from './tradeInPromotionalCardHelper';
import {
    initializeOverlayOpenEvent,
    mountOverlay,
} from 'Component/Overlay';
import { OverlayActionDispatchers } from 'Container/Overlay/actions';

/**
 * Get promotional card props from additionalPageOptions
 * @param cardFromAdditionalPageOptions card properties from additional page options
 */
export const getPromotionalCardProps = (cardFromAdditionalPageOptions: PromotionalCardProps) => {
    const promotionalCardProps: IPromotionalCardProperties = {
        stdSystemIconName: cardFromAdditionalPageOptions.stdIcon,
        stdLabel: cardFromAdditionalPageOptions.stdLabel,
        txtSublabel: cardFromAdditionalPageOptions.txtSublabel,
        business: NO_PATTERN_BUSINESS_LOGIC,
    };

    // Flag badge
    if (cardFromAdditionalPageOptions.flagBadge) {
        const { stdLabel, optColor } = cardFromAdditionalPageOptions.flagBadge;
        promotionalCardProps.containerFlagBadge = {
            stdLabel,
            optColor,
            business: NO_PATTERN_BUSINESS_LOGIC,
        };
    }

    // Checkbox
    if (cardFromAdditionalPageOptions.checkbox) {
        const checkboxProps: IFormSelectionControlProperties = {
            stdGroupName: `${PROMOTIONAL_CARD_CHECKBOX_GROUP_NAME}${cardFromAdditionalPageOptions.stdId}`,
            optType: 'checkbox',
            hasError: false,
            items: [
                {
                    txtLabelText: cardFromAdditionalPageOptions.checkbox.txtLabelText,
                    stdValue: cardFromAdditionalPageOptions.checkbox.stdValue,
                    stdID: `${PROMOTIONAL_CARD_CHECKBOX_ID}${cardFromAdditionalPageOptions.stdId}`,
                    spacing: cardFromAdditionalPageOptions.checkbox.spacing,
                },
            ],
            business: NO_PATTERN_BUSINESS_LOGIC,
        };

        promotionalCardProps.containerFormSelectionControl = checkboxProps;
        promotionalCardProps.stdConfirmationText = cardFromAdditionalPageOptions.checkbox.stdConfirmationText;
    }

    return promotionalCardProps;
};

/** filter promotional cards with ShouldBeHiddenWith array */
export const filterPromotionalCards = (
    cards: PromotionalCardProps[],
): PromotionalCardProps[] => {

    const filteredCards = cards.filter(card =>
        !card?.shouldBeHiddenWith?.some(id => cards.some(promoCard => promoCard.stdId === id)),
    );

    return filteredCards;
};

/**
 * create Promotional Card Wrapper
 */
const createPromotionalCardWrapper = (): HTMLElement => {
    let wrapper = document.getElementById(PROMOTIONAL_CARD_WRAPPER_ID) as HTMLElement;

    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.id = PROMOTIONAL_CARD_WRAPPER_ID;

        document.body.appendChild(wrapper);
    }
    // Empty the wrapper element

    return wrapper;
};

/**
 * Initialize Overlay In Promo Tile
 * @param promotionalCardContainer promotional card element
 * @param cardStdId card id
 * @param getOverlayContentAction get overlay content action
 */
const initializeOverlayInPromoTile = (promotionalCardContainer: HTMLElement, cardStdId: string, getOverlayContentAction: OverlayActionDispatchers['getOverlayContent']) => {
    const linkElements = promotionalCardContainer.querySelectorAll('[data-action="overlay"]');

    linkElements.forEach(overlayLink => {
        const overlay = mountOverlay(`${PROMOTIONAL_CARD_OVERLAY_CONTAINER_ID_PREFIX}${cardStdId}`);
        initializeOverlayOpenEvent(overlay, overlayLink as HTMLElement, getOverlayContentAction);
    });
};

/**
 * render Promotional card component
 * @param cardStdId id of  card
 * @param wrapper parent wrapper from all cards
 * @param promotionalCardProps Promotional Card Props,
 * @param getOverlayContentAction action dispatcher from OverlayActionDispatchers
 */
export const renderCard = (cardStdId: string, wrapper: HTMLElement, promotionalCardProps: PromotionalCardProps,
    getOverlayContentAction:OverlayActionDispatchers['getOverlayContent']) => {
    const containerId = `${PROMOTIONAL_CARD_CONTAINER_ID}${cardStdId}`;
    const container = document.createElement('div');
    container.id = containerId;
    wrapper.append(container);
    const iPromotionalCardProps: IPromotionalCardProperties = getPromotionalCardProps(promotionalCardProps);

    mountPromotionalCardById(`${PROMOTIONAL_CARD_CONTAINER_ID}${cardStdId}`, iPromotionalCardProps);
    initializeOverlayInPromoTile(wrapper, cardStdId, getOverlayContentAction);
};

/**
 * get Promotional Cards From Additional Page Options
 * @param deviceId  device id
 * @param salesChannel  sales channel
 * @param subscriptionId  subscription id
 */
export const getPromotionalCardsFromAdditionalPagesOptions = (deviceId: string, salesChannel: SalesChannel, subscriptionId: string) => {
    const promotionalCards = (window as any).additionalPageOptions.promotionalCard;
    const devicePromotionalCards = promotionalCards?.[deviceId];

    const getCards = (key:string) => promotionalCards[key] || [];
    const getDeviceCards = (key:string) => devicePromotionalCards?.[key] || [];

    return [...getCards(salesChannel),
        ...getCards(subscriptionId),
        ...getDeviceCards('device'),
        ...getDeviceCards(salesChannel),
        ...getDeviceCards(subscriptionId)];
};

/**
 * get GigaKombi Promotional Card
 * @param offer  Tariff with hardware offer
 * @param salesChannel  sales channel
 * @param setPromotionalSummaryCardOffer action dispatcher from TariffActionDispatchers
 */
export const getGigaKombiPromotionalCard = (offer: TariffWithHardwareOffer | null, salesChannel: SalesChannel, setPromotionalSummaryCardOffer: TariffActionDispatchers['setPromotionalSummaryCardOffer']):PromotionalCardProps | undefined=> {
    const gigakombiType = getGigakombiType();
    const isGigakombiEligibleAndOfferExists = offer && gigakombiType;
    let promotionCard;

    if (isGigakombiEligibleAndOfferExists && gigakombiType !== GIGAKOMBI_TV) {
        const gigakombiSocs: string[] = getGigakombiDiscountSocs(salesChannel, undefined, gigakombiType);

        const offerPrice = getGigaKombiOfferPrice(offer.discount, gigakombiSocs);
        const isExtraGB = hasExtraGb(salesChannel, gigakombiType);
        setPromotionalSummaryCardOffer({ offerPrice });
        promotionCard = getGigaKombiPromotionCardProperties(offer.discount, offerPrice, gigakombiSocs, gigakombiType, isExtraGB);

    }

    return promotionCard;
};

/**
 * mount Promotional Card List
 * @param deviceId  device id
 * @param salesChannel  sales channel
 * @param subscriptionId  subscription id
 * @param offer  Tariff with hardware offer
 * @param setPromotionalSummaryCardOffer action dispatcher from TariffActionDispatchers
 * @param getOverlayContentAction action dispatcher from OverlayActionDispatchers
 * @param isTauschbonus  taushbonus flag
 * @param isTradeIn tradein flag
 */
export const mountPromotionalCardList = (
    deviceId: string,
    salesChannel: SalesChannel,
    subscriptionId: string,
    offer: TariffWithHardwareOffer | null,
    setPromotionalSummaryCardOffer: TariffActionDispatchers['setPromotionalSummaryCardOffer'],
    getOverlayContentAction:OverlayActionDispatchers['getOverlayContent'],
    isTauschbonus:boolean,
    isTradeIn:boolean,
) => {
    const wrapper = createPromotionalCardWrapper();
    const promotionalCards = getPromotionalCardsFromAdditionalPagesOptions(deviceId!, salesChannel!, subscriptionId!);
    const gigaKombiCard = getGigaKombiPromotionalCard(offer, salesChannel!, setPromotionalSummaryCardOffer);
    const mergedCards = promotionalCards;

    if (gigaKombiCard) {
        mergedCards.unshift(gigaKombiCard);
    }

    if (isTradeIn) {
        const tradeInPromotinalCard = getTradeInPromotionCardProperties(isTauschbonus, deviceId);
        mergedCards.unshift(tradeInPromotinalCard);
    }

    wrapper.innerHTML = '';
    const filteredCard = filterPromotionalCards(mergedCards);
    filteredCard.forEach(card =>
        renderCard(card.stdId, wrapper, card, getOverlayContentAction),
    );

    // Initialize simplicity footnotes
    (window as any).vf.footnotes.init();
};
