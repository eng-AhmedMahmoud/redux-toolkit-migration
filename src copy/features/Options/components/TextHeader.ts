import { NO_PATTERN_BUSINESS_LOGIC } from '@vfde-brix/ws10/core';
import {
    createTextHeader,
    TextHeader,
} from '@vfde-brix/ws10/text-header';
import { startAppListening } from '../../../app/listener';
import { selectDeviceName } from '../selectors';

/**
 * Mount TextHeader
 */
export const mountTextHeader = (containerId: string): TextHeader | null => {
    const container = document.getElementById(containerId) as HTMLElement;

    /* istanbul ignore if */
    if (!container) {
        return null;
    }

    const textHeader = createTextHeader(container, NO_PATTERN_BUSINESS_LOGIC);
    listenForTextHeaderUpdates(textHeader);

    return textHeader;
};

/**
 *
 */
export const listenForTextHeaderUpdates = (textHeader: TextHeader) => {
    startAppListening({
        predicate: (_action, currentState, previousState) =>
            selectDeviceName(currentState) !== selectDeviceName(previousState),
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const newDeviceName = selectDeviceName(state);

            if (newDeviceName) {
                updateTextHeader(textHeader, newDeviceName);
            }
        },
    });
};

/**
 * Update TextHeader
 */
export const updateTextHeader = (textHeader: TextHeader, headline: string): void => {
    textHeader.update({ stdHeadline: headline });
};
