import {
    createUnorderedHorizontalList,
    UnorderedHorizontalList,
} from '@vfde-brix/ws10/unordered-horizontal-list';
import { NO_PATTERN_BUSINESS_LOGIC } from '@vfde-brix/ws10/core';
import { PIBS_LINK_IDENTIFIER } from '../constants';
import { getPibs } from '../helpers/getTariffInfoFromAdditionalPageOptions';
import { startAppListening } from '../../../app/listener';
import { selectSubscriptionId } from '../selectors';

/**
 * Mount Unordered Horizontal List Block
 */
export const mountUnorderedHorizontalList = (containerId: string): UnorderedHorizontalList => {
    const container = document.getElementById(containerId) as HTMLElement;
    const unorderedHorizontalList = container && createUnorderedHorizontalList(container, NO_PATTERN_BUSINESS_LOGIC);

    listenForUpdates(unorderedHorizontalList);

    return unorderedHorizontalList;
};

/**
 * Update Unordered Horizontal List Block
 */
const updateUnorderedHorizontalList = (component: UnorderedHorizontalList, subscriptionId: string) => {
    const { items } = component.getProperties();

    for (const item of items) {
        if (item.stdIdentifier === PIBS_LINK_IDENTIFIER && item.link) {
            item.link.stdLinkUrl = getPibs(subscriptionId);
        }
    }

    component.update({ items });
};

/**
 * listner to update unorderedHorizontalList
 */
const listenForUpdates = (unorderedHorizontalList: UnorderedHorizontalList) => {
    startAppListening({
        predicate: (_action, currentState, previousState) =>
            selectSubscriptionId(currentState) !== selectSubscriptionId(previousState),
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const subscriptionId = selectSubscriptionId(state);
            subscriptionId &&
                updateUnorderedHorizontalList(
                    unorderedHorizontalList,
                    subscriptionId,
                );
        },
    });
};
