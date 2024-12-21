import {
    createItemSummaryCard,
    ItemSummaryCard,
} from '@vfde-brix/ws10/item-summary-card';
import { useAppDispatch } from '../../../app/store';
import { startAppListening } from '../../../app/listener';
import {
    selectIsTradeInSelected,
    selectSelectedTradeInDevice,
} from '../selectors';
import { deleteSelectedTradeInDevice } from '../slice';
import getTradeInItemSummaryCardProps from '../helpers/getTradeInItemSummaryCardProps';
import { updateItemSummaryCard } from '../helpers/itemSummaryCardHelpers';

/**
 * Mounts the tradeIn summary card
 * for the selected device
 */
export const mountTradeInItemSummaryCard = (containerId: string): ItemSummaryCard | null => {
    const containerElement = document.getElementById(containerId);

    /* istanbul ignore if */
    if (!containerElement) {
        return null;
    }

    const dispatch = useAppDispatch();

    const onDeleteButtonClick = () => {
        dispatch(deleteSelectedTradeInDevice());
    };

    const itemSummaryCard = createItemSummaryCard(containerElement, {
        onDeleteButtonClick,
    });

    listenForUpdates(itemSummaryCard);

    return itemSummaryCard;
};

const listenForUpdates = (itemSummaryCard: ItemSummaryCard) => {

    startAppListening({
        predicate: (_action, currentState) =>{
            const isSelectedTradeInDevice = !!selectSelectedTradeInDevice(currentState);

            return (!isSelectedTradeInDevice && selectIsTradeInSelected(currentState))
            || (isSelectedTradeInDevice && !selectIsTradeInSelected(currentState))
            || (!isSelectedTradeInDevice && !selectIsTradeInSelected(currentState));
        }
        ,
        effect: () => {
            // if there is no selectedTradeInDevice but tradeIn picker is 'yes'
            // Or there is selectedTradeInDevice but tradeIn picker is 'No' hide itemSummaryCard
            itemSummaryCard && itemSummaryCard?.toggleContainer(true, true);
        },
    });

    startAppListening({
        predicate: (_action, currentState) =>
            !!selectSelectedTradeInDevice(currentState) && selectIsTradeInSelected(currentState)
        ,
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();

            // in this case tradeIn picker is 'yes' and selectedTradeInDevice is present
            // which means we must show itemSummaryCard
            // so the user is able to see his selected device
            itemSummaryCard && updateItemSummaryCard(itemSummaryCard, getTradeInItemSummaryCardProps(state));
            itemSummaryCard && itemSummaryCard?.toggleContainer(false, true);
        },
    });
};

