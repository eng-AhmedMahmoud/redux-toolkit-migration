import {
    ButtonLink,
    createButtonLink,
} from '@vfde-brix/ws10/button-link';
import { TARIFF_OVERLAY_CONTAINER_ID } from '../container/Tariff/constants';
import {
    mountOverlay,
    initializeOverlayOpenEvent,
} from './Overlay';
import { NO_PATTERN_BUSINESS_LOGIC } from '@vfde-brix/ws10/core';
import { OverlayActionDispatchers } from '../container/Overlay/actions';

/**
 * Mount Button Link component
 */
export const mountTariffOverlayButtonLink = (
    containerId: string,
    getOverlayContentAction: OverlayActionDispatchers['getOverlayContent'],
): ButtonLink | null => {
    const containerElement = document.getElementById(containerId);

    initializeOverlayInTariffSection(containerElement, getOverlayContentAction);

    return containerElement && createButtonLink(containerElement, NO_PATTERN_BUSINESS_LOGIC);

};

/**
 * add open overlay functionality to the button link
 */

const initializeOverlayInTariffSection = (TariffButtonLinkContainer: HTMLElement | null, getOverlayContentAction: OverlayActionDispatchers['getOverlayContent']) => {
    const overlayLink = TariffButtonLinkContainer?.querySelector('[data-action="ws10-overlay"]');

    const overlay = mountOverlay(TARIFF_OVERLAY_CONTAINER_ID);
    initializeOverlayOpenEvent(overlay, overlayLink as HTMLElement, getOverlayContentAction);
};
