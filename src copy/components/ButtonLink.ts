import {
    ButtonLink,
    createButtonLink,
} from '@vfde-brix/ws10/button-link';
import { NO_PATTERN_BUSINESS_LOGIC } from '@vfde-brix/ws10/core';
import { OVERLAY_BASE_CLASSNAME } from '@vfde-brix/ws10/overlay';
import {
    initializeOverlayOpenEvent,
    mountOverlay,
} from './Overlay';

/**
 * Mounts an ButtonLink by ID
 */
export const mountButtonLink = (containerId: string): ButtonLink | null => {
    const containerElement = document.getElementById(containerId);

    /* istanbul ignore if */
    if (!containerElement) {
        return null;
    }

    return createButtonLink(containerElement, NO_PATTERN_BUSINESS_LOGIC);
};

/**
 * add open overlay functionality to the button link
 */
export const initializeOverlay = (
    ButtonLinkContainer: HTMLElement | null,
    overlayContainerID: string,
) => {
    const overlayLink = ButtonLinkContainer?.querySelector(
        `[data-action=${OVERLAY_BASE_CLASSNAME}]`,
    );

    const overlay = mountOverlay(overlayContainerID);
    initializeOverlayOpenEvent(
        overlay,
        overlayLink as HTMLElement,
    );
};
