import {
    createIconText,
    IconText,
} from '@vfde-brix/ws10/icon-text';
import { NO_PATTERN_BUSINESS_LOGIC } from '@vfde-brix/ws10/core';

/**
 * Mount icon text
 */
export const mountIconText = (containerId: string): IconText => {
    const container = document.getElementById(containerId) as HTMLElement;

    return container && createIconText(container, NO_PATTERN_BUSINESS_LOGIC);
};

/**
 * Update the IconText
 */
export const updateIconText = (
    component: IconText,
    txtContent: string,
): void => component.update({ txtContent });
