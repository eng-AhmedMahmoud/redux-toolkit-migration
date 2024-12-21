import {
    GET_OVERLAY_CONTENT,
    OPEN_OVERLAY,
} from './constants';
import { Overlay } from '@vfde-brix/ws10/overlay';
import { ExtractActions } from '@vfde-sails/core';

/**
 * Fetch the overlay content
 */
export const getOverlayContent = (href: string, overlay: Overlay) => ({
    type: GET_OVERLAY_CONTENT,
    href,
    overlay,
});

/**
 * Open overlay
 */
export const openOverlay = (overlay: Overlay) => ({
    type: OPEN_OVERLAY,
    overlay,
});

/**
 * Overlay Action Creators Object
 */
export const overlayActionCreators = {
    getOverlayContent,
    openOverlay,
};

/**
 * Overlay Action Dispatchers Object
 */
export const overlayActionDispatchers = {
    getOverlayContent,
};

/**
 * Overlay Action Creators
 */
export type OverlayActionCreators = typeof overlayActionCreators;

/**
 * Options Action Dispatchers
 */
export type OverlayActionDispatchers = typeof overlayActionDispatchers;

/**
 * Union Action Type
 */
export type OverlayAction = ExtractActions<OverlayActionCreators>;
