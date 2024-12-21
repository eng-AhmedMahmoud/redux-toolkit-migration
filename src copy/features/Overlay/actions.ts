import { requestHtml } from '@vfde-sails/utils';
import {
    GET_OVERLAY_CONTENT,
    MOUNT_OVERLAY,
    OPEN_OVERLAY,
} from './constants';
import { Overlay } from '@vfde-brix/ws10/overlay';
import { createAction } from '@reduxjs/toolkit';

/**
 * Fetch the overlay content
 */
export const getOverlayContent = createAction(GET_OVERLAY_CONTENT, (href: string, overlay: Overlay) => (
    { payload: { href, overlay } }
));

/**
 * mount the overlay content
 */
export const mountOverlayContent = createAction(MOUNT_OVERLAY, (response: Awaited<ReturnType<typeof requestHtml>>, overlay: Overlay) => (
    { payload: { response, overlay } }
));

/**
 * Open overlay
 */
export const openOverlay = createAction(OPEN_OVERLAY, (overlay: Overlay) => (
    { payload: { overlay } }
));
