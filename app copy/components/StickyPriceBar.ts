import { NO_PATTERN_BUSINESS_LOGIC } from '@vfde-brix/ws10/core';
import {
    StickyPriceBar,
    createStickyPriceBar,
} from '@vfde-brix/ws10/sticky-price-bar';

/**
 * Mount Sticky Price Bar using 'writeDom'
 */
export const mountStickyPriceBar = (containerId: string): StickyPriceBar | null => {
    const container = document.getElementById(containerId) as HTMLElement;

    /* istanbul ignore if */
    if (!container) {
        return null;
    }

    const offerSummaryCard = createStickyPriceBar(container, {
        stickyPriceBarItems: [],
        business: NO_PATTERN_BUSINESS_LOGIC,
    });

    return offerSummaryCard;
};
