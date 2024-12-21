// Default
export const APP = 'VVL_HARDWARE_DETAIL';

export const CONTAINER_TARIFF = 'TARIFF';
export const CONTAINER_TRADEIN = 'TRADEIN';
export const CONTAINER_HARDWARE_ONLY = 'HARDWARE_ONLY';
/**
 * Overlay Container
 */
export const CONTAINER_OVERLAY = 'OVERLAY';
// #region HTML IDs

export const HTML_CONTAINER_ID_PREFIX = 'vvl-hardware-details';

export const ERROR_NOTIFICATION_CONTAINER_ID = `${HTML_CONTAINER_ID_PREFIX}-error-notification` as const;
export const HARDWARE_ONLY_SWITCH_CONTAINER_ID = `${HTML_CONTAINER_ID_PREFIX}-hardware-only-switch` as const;
export const PROMOS_CONTAINER_ID = `${HTML_CONTAINER_ID_PREFIX}-promos` as const;
export const OFFER_SUMMARY_CARD_CONTAINER_ID = `${HTML_CONTAINER_ID_PREFIX}-offer-summary-card` as const;
export const STICKY_PRICE_BAR_CONTAINER_ID = `${HTML_CONTAINER_ID_PREFIX}-sticky-price-bar` as const;
export const TRADEIN_PROMO_ICON_TEXT_LIST_CONTAINER_ID = `${HTML_CONTAINER_ID_PREFIX}-promo-overview-icon-text-list` as const;
export const OVERLAY_CONTAINER_ID = `${HTML_CONTAINER_ID_PREFIX}-overlay` as const;

// #endregion

// #region TradeIn HTML IDs
export const TRADEIN_HTML_CONTAINER_ID_PREFIX = `${HTML_CONTAINER_ID_PREFIX}-tradein`;
export const TAUSCHBONUS_HTML_CONTAINER_ID_PREFIX = `${HTML_CONTAINER_ID_PREFIX}-tauschbonus`;

export const TRADEIN_OPTION_PICKER_CONTAINER_ID = `${TRADEIN_HTML_CONTAINER_ID_PREFIX}-option-picker`;

export const TAUSCHBONUS_INFO_CONTAINER_ID = `${TAUSCHBONUS_HTML_CONTAINER_ID_PREFIX}-info`;

export const TAUSCHBONUS_PROMOTIONAL_CARD_CONTAINER_ID = `${TAUSCHBONUS_HTML_CONTAINER_ID_PREFIX}-promotional-card`;
export const TRADEIN_INPUT_ID = `${TRADEIN_HTML_CONTAINER_ID_PREFIX}-input`;
export const TRADEIN_SUGGEST_INPUT_CONTAINER_ID = `${TRADEIN_HTML_CONTAINER_ID_PREFIX}-suggest-input`;
export const TRADEIN_SUGGEST_INPUT_HEADLINE_CONTAINER_ID = `${TRADEIN_HTML_CONTAINER_ID_PREFIX}-suggest-input-headline`;
export const TRADEIN_STATUS_NOTIFICATION_CONTAINER_ID = `${TRADEIN_HTML_CONTAINER_ID_PREFIX}-status-notification`;
export const TRADEIN_ITEM_SUMMERY_CARD_CONTAINER_ID = `${TRADEIN_HTML_CONTAINER_ID_PREFIX}-item-summary-card`;

export const TRADEIN_TAUSCHBONUS_PROMOTIONAL_CARD_CONTAINER_ID = `${HTML_CONTAINER_ID_PREFIX}-promotional-card-tradeIn-tauschbonus`;

// #endregion

// #region Misc

export const DEEPLINK_SESSION_STORAGE_KEY = 'deeplink' as const;
export const GIGAKOMBI_TOKEN_PARAM = 'token' as const;
export const GIGAKOMBI_OVERLAY_NAME = 'gigakombi-login' as const;
export const GIGAKOMBI_OVERLAY_GIGAKOMBI_BUTTON_ID = 'overlay-button-basket-gigakombi' as const;
export const GIGAKOMBI_OVERLAY_NO_GIGAKOMBI_BUTTON_ID = 'overlay-button-basket' as const;

// #endregion
