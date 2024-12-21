import { IconText } from '@vfde-brix/ws10/icon-text';
import { startAppListening } from '../../../app/listener';
import { mountIconText } from '../../../components/IconText';
import {
    selectAtomicDevice,
    selectShippingInfo,
} from '../selectors';
import { RootState } from '../../../app/store';

/**
 * Mounts an IconText by ID
 */
export const mountDeliveryDateIconText = (containerId: string): IconText | null => {
    const iconText = mountIconText(containerId);

    /* istanbul ignore if */
    if (!iconText) {
        return null;
    }

    listenForUpdates(iconText);

    return iconText;
};

const listenForUpdates = (iconText: IconText) => {
    startAppListening({
        predicate: (_action, currentState, previousState) =>
            selectShippingInfo(currentState) !== selectShippingInfo(previousState)
        ,
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();

            updateDeliveryDate(state, iconText);
        },
    });
};

const updateDeliveryDate = (state: RootState, iconText: IconText) => {
    const atomic = selectAtomicDevice(state);
    const txtContent = atomic!.shippingInfo.label;

    iconText.update({
        txtContent,
    });
};
