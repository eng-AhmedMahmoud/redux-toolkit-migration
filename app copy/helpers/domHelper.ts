import { CLASSNAME_HIDDEN } from '@vfde-brix/ws10/styles';
import {
    SALESCHANNEL_CONSUMER,
    SALESCHANNEL_YOUNG,
    SalesChannel,
} from '@vfde-sails/constants';
import {
    GIGAMOBIL_TARIFF_OPTION_PICKER_CONTAINER_ID,
    GIGAMOBIL_YOUNG_TARIFF_OPTION_PICKER_CONTAINER_ID,
} from '../container/Tariff/constants';
import {
    GIGAKOMBI_CONSUMER_BUTTON_LINK,
    GIGAKOMBI_YOUNG_BUTTON_LINK,
} from '../container/App/constants';

/**
 * Shows or hides the element with the given ID
 * (toggles the 'ws10-is-hidden' class on the element)
 * @param elementId ID of the element
 * @param shouldHide If true, the element will be hidden, otherwise shown.
 * If ommitted, the 'ws10-is-hidden' will be toggled
 */
export const toggleElementById = (elementId: string, shouldHide?: boolean): void => {
    const element = document.getElementById(elementId);
    element && element.classList.toggle(CLASSNAME_HIDDEN, shouldHide);
};

/**
 * Toggle Gigamobil and Gigamobil Young Option Pickers
 * @param salesChannel sales channel
 */
export const toggleTariffOptionPickers = (salesChannel: SalesChannel): void => {
    toggleElementById(GIGAMOBIL_TARIFF_OPTION_PICKER_CONTAINER_ID, salesChannel === SALESCHANNEL_YOUNG);
    toggleElementById(GIGAMOBIL_YOUNG_TARIFF_OPTION_PICKER_CONTAINER_ID, salesChannel === SALESCHANNEL_CONSUMER);
};

/**
 * Toggle Tariff Overlay Button Link
 * @param salesChannel sales channel
 */
export const toggleTariffOverlayButtonLink = (salesChannel: SalesChannel): void => {
    toggleElementById(GIGAKOMBI_CONSUMER_BUTTON_LINK, salesChannel === SALESCHANNEL_YOUNG);
    toggleElementById(GIGAKOMBI_YOUNG_BUTTON_LINK, salesChannel === SALESCHANNEL_CONSUMER);
};
