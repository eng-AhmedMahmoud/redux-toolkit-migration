import { NO_PATTERN_BUSINESS_LOGIC } from '@vfde-brix/ws10/core';
import {
    createHeadline,
    Headline,
} from '@vfde-brix/ws10/headline';

/**
 * Mount the headline
 */
export const mountHeadline = (containerId: string): Headline => {
    const container = document.getElementById(containerId) as HTMLElement;

    return container && createHeadline(container, NO_PATTERN_BUSINESS_LOGIC);
};

/**
 * Update headline
 */
export const updateHeadline = (headline: Headline, content: string): void => {

    headline.update({ stdContent: content });
};
