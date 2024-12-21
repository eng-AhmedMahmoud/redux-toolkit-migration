import {
    createItemSummaryCard,
    IItemSummaryCardBusinessLogic,
    IItemSummaryCardItemProperties,
    ItemSummaryCard,
} from '@vfde-brix/ws10/item-summary-card';

/**
 * Mounts item summary card component
 */
const mountItemSummaryCard = (
    containerId: string,
    businessLogic: IItemSummaryCardBusinessLogic,
): ItemSummaryCard | null => {
    const containerElement = document.getElementById(containerId);

    if (!containerElement) {
        /* istanbul ignore next */
        return null;
    }

    const itemSummaryCard = createItemSummaryCard(containerElement, {
        ...businessLogic,
    });

    return itemSummaryCard;
};

/**
 * Updates the ItemSummaryCard with the given state
 */
export const updateItemSummaryCard = (itemSummaryCard: ItemSummaryCard, itemSummaryCardProps: IItemSummaryCardItemProperties[]) => {

    // Update the itemSummaryCard with the updated items
    itemSummaryCard.update({
        items: itemSummaryCardProps,
    });
};

export default mountItemSummaryCard;
