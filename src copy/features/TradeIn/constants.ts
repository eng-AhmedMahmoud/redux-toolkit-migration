import {
    TAUSCHBONUS_HTML_CONTAINER_ID_PREFIX,
    TRADEIN_HTML_CONTAINER_ID_PREFIX,
} from '../../app/constants';

export const TRADEIN_SLICE = 'TRADE_IN';
// #region Misc
export const TRADEIN_INPUT_DEBOUNCE_DURATION = 250;
export const TRADEIN_INPUT_MIN_LENGTH = 1;
export const TRADEIN_INPUT_MAX_LENGTH = 30; // this value is defined by the tradeIn API, it is not randomly picked.
// #end region

// #region API
export const API_KEY = 'djc0a0pjbDBUQVFaZjc3OVNPbzJZQnA4Z1IzaXZaV0M6U1lBdlVjbjlmVllPRzQ2dw==';
export const API_DEV_KEY = 'S0FvNVJQUGhHcGpmN1F6T0ZDVkNWdThBbkFtZEIxVEI6ZldPdUdaZUNWWllWYWJSSg==';
export const API_URL = '/tmf-api/productCatalogManagement/v4/productOffering';
export const API_CREDENTIALS = {
    prod: {
        url: `https://eu2.api.vodafone.com${API_URL}`,
        key: API_KEY,
    },
    dev: {
        url: `https://eu2-stagingref.api.vodafone.com${API_URL}`,
        key: API_DEV_KEY,
    },
};
export const TRADE_IN_API_QUERY_PARAM = 'prodSpecCharValueUse';
export const SAILS_PARAM_TRADE_IN_DEVICE = 'tradeInDevice';
export const TRADE_IN_OVERLAY_BUTTON_LINK = `${TRADEIN_HTML_CONTAINER_ID_PREFIX}-overlay-button-link`;
export const TAUSCHBONUS_OVERLAY_BUTTON_LINK = `${TAUSCHBONUS_HTML_CONTAINER_ID_PREFIX}-overlay-button-link`;
export const TAUSCHBONUS_OVERLAY = `${TAUSCHBONUS_HTML_CONTAINER_ID_PREFIX}-overlay`;
export const TRADE_IN_OVERLAY = `${TRADEIN_HTML_CONTAINER_ID_PREFIX}-overlay`;
// #end region
