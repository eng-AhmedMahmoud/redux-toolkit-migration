import {
    IItemSummaryCardItemProperties,
    ItemSummaryCard,
} from '@vfde-brix/ws10/item-summary-card';

/**
 * Update the itemSummaryCard with the updated items
 */
export const updateItemSummaryCard = (itemSummaryCard: ItemSummaryCard, itemSummaryCardProps: IItemSummaryCardItemProperties[]) => {

    itemSummaryCard.update({
        items: itemSummaryCardProps,
    });
};
