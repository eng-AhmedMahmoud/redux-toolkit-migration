import {
    ButtonLink,
    createButtonLink,
} from '@vfde-brix/ws10/button-link';
import { OVERLAY_BASE_CLASSNAME } from '@vfde-brix/ws10/overlay';
import {
    mountOverlay,
    initializeOverlayOpenEvent,
} from './Overlay';
import { NO_PATTERN_BUSINESS_LOGIC } from '@vfde-brix/ws10/core';
import { OverlayActionDispatchers } from '../container/Overlay/actions';

/**
 * Mount Button Link component
 */
export const mountTradeInButtonLink = (containerId: string): ButtonLink | null => {
    const containerElement = document.getElementById(containerId);

    return containerElement && createButtonLink(containerElement, NO_PATTERN_BUSINESS_LOGIC);
};

/**
 * add open overlay functionality to the button link
 */
export const initializeOverlay = (
    ButtonLinkContainer: HTMLElement | null,
    getOverlayContentAction: OverlayActionDispatchers['getOverlayContent'],
    overlayContainerID: string,
) => {
    const overlayLink = ButtonLinkContainer?.querySelector(
        `[data-action=${OVERLAY_BASE_CLASSNAME}]`,
    );

    const overlay = mountOverlay(overlayContainerID);
    initializeOverlayOpenEvent(
        overlay,
        overlayLink as HTMLElement,
        getOverlayContentAction,
    );
};
