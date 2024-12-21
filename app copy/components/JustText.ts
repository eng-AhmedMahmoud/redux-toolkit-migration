import {
    createJustText,
    IJustTextProperties,
    JustText,
} from '@vfde-brix/ws10/just-text';
import {
    IPatternBusinessLogic,
    NO_PATTERN_BUSINESS_LOGIC,
} from '@vfde-brix/ws10/core';

/**
 * Mount JustText component
 */
export const mountJustText = (containerId: string, properties: IPatternBusinessLogic | IJustTextProperties = NO_PATTERN_BUSINESS_LOGIC): JustText | null => {
    const container = document.getElementById(containerId);
    const textContainer = container && container.lastElementChild as HTMLElement;

    return textContainer && createJustText(textContainer, properties);
};

/**
 * Update JustText
 */
export const updateJustText = (justText: JustText, content: string): void => {

    justText.update({ content });
};
