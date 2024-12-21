import { NO_PATTERN_BUSINESS_LOGIC } from '@vfde-brix/ws10/core';
import {
    createTextHeader,
    TextHeader,
} from '@vfde-brix/ws10/text-header';

/**
 * Mount TextHeader
 */
export const mountTextHeader = (containerId: string): TextHeader => {
    const container = document.getElementById(containerId) as HTMLElement;

    return container && createTextHeader(container, NO_PATTERN_BUSINESS_LOGIC);
};

/**
 * Update TextHeader
 */
export const updateTextHeader = (textHeader: TextHeader, headline: string): void => {
    textHeader.update({ stdHeadline: headline });
};
