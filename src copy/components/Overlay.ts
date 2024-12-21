import {
    OVERLAY_ALIGNMENT_LEFT,
    createOverlay,
} from '@vfde-brix/ws10/overlay';
import { NO_PATTERN_BUSINESS_LOGIC } from '@vfde-brix/ws10/core';
import { Overlay } from '@vfde-brix/ws10/overlay';
import { getOverlayContent } from '../features/Overlay/actions';
import { useAppDispatch } from '../app/store';

/**
 * Overlay
 */
export const mountOverlay = (containerId: string): Overlay => {
    let container = document.getElementById(containerId) as HTMLElement;

    if (!container) {
        container = document.createElement('div');
        container.id = containerId;

        document.body.appendChild(container);
    }

    return createOverlay(container, {
        optPaddingLayout: true,
        optContentAlign: OVERLAY_ALIGNMENT_LEFT,
        business: NO_PATTERN_BUSINESS_LOGIC,
    });
};

/**
 * Initialize Overlay Open Event
 */
export const initializeOverlayOpenEvent = (overlay: Overlay, linkElement: HTMLElement): void => {
    const onClickHandler = (event: Event): void => {
        event.preventDefault();
        const target = event.currentTarget as HTMLAnchorElement;
        const href = target.getAttribute('href');

        const dispatch = useAppDispatch();
        href && dispatch(getOverlayContent(href, overlay));
    };

    linkElement.addEventListener('click', onClickHandler);
};
