import {
    createUnorderedHorizontalList,
    UnorderedHorizontalList,
} from '@vfde-brix/ws10/unordered-horizontal-list';
import { NO_PATTERN_BUSINESS_LOGIC } from '@vfde-brix/ws10/core';
import { PIBS_LINK_IDENTIFIER } from '../container/Tariff/constants';
import { getPibs } from '../container/Tariff/helpers/getTariffInfoFromAdditionalPageOptions';

/**
 * Mount Unordered Horizontal List Block
 */
export const mountUnorderedHorizontalList = (containerId: string): UnorderedHorizontalList => {
    const container = document.getElementById(containerId) as HTMLElement;

    return container && createUnorderedHorizontalList(container, NO_PATTERN_BUSINESS_LOGIC);
};

/**
 * Update Unordered Horizontal List Block
 */
export const updateUnorderedHorizontalList = (component: UnorderedHorizontalList, subscriptionId: string) => {
    const { items } = component.getProperties();

    for (const item of items) {
        if (item.stdIdentifier === PIBS_LINK_IDENTIFIER && item.link) {
            item.link.stdLinkUrl = getPibs(subscriptionId);
        }
    }

    component.update({ items });
};
