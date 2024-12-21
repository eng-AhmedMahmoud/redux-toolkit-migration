import { Notification } from '@vfde-brix/ws10/notification';
import { startAppListening } from '../../../app/listener';
import { mountNotification } from '../../../components/Notification';
import {
    selectSelectedTradeInDevice,
    selectTradeInDevices,
    selectHasError,
    selectIsTradeInSelected,
    selectIsDeviceNotFound,
} from '../selectors';
import { getTradeInSuggestInputNotificationContent } from '../../../helpers/getTradeInHelpers';
import { TRADEIN_STATUS_NOTIFICATION_CONTAINER_ID } from '../../../app/constants';
import { isEqual } from 'lodash';
import { updateNotification } from '../helpers/notificationForSuggestInputStatusHelpers';

/**
 * Mounts a Notification
 */
export const mountNotificationForSuggestInputStatus = (containerId: string): Notification | null => {
    const notification = mountNotification(containerId);

    /* istanbul ignore if */
    if (!notification) {
        return null;
    }

    listenForUpdates(notification);

    return notification;
};

const listenForUpdates = (notification: Notification) => {
    startAppListening({
        predicate: (_action, currentState, previousState) =>{
            const selectedTradeInDeviceChanged = selectSelectedTradeInDevice(currentState) !== selectSelectedTradeInDevice(previousState);
            const hasErrorChanged = selectHasError(currentState) !== selectHasError(previousState);
            const isDeviceNotFoundChanged = selectIsDeviceNotFound(currentState) !== selectIsDeviceNotFound(previousState);
            const isSelectedTradeInDevice = !!selectSelectedTradeInDevice(currentState);

            return (selectedTradeInDeviceChanged && isSelectedTradeInDevice)
            || (!isSelectedTradeInDevice && !isEqual(selectTradeInDevices(currentState), selectTradeInDevices(previousState)))
            || (hasErrorChanged || isDeviceNotFoundChanged)
            || (!isSelectedTradeInDevice && !selectIsTradeInSelected(currentState) && selectIsTradeInSelected(previousState));
        }
        , effect: (_action, listenerApi)=> {
            const state = listenerApi.getState();
            // if a new device was selected Or device list has changed, so we update suggestInputNotification
            // Or if the device-list stayed the same but the 'hasError' state or 'isDeviceNotFound' state changed
            // so we update the notification only to show the current error or hide the notification if there is no error
            // Or if there is no selectedTradeInDevice and tradeIn picker switched from 'yes' to 'no'
            // so we update notification so it becomes hidden
            notification && updateNotification(getTradeInSuggestInputNotificationContent(state), notification, TRADEIN_STATUS_NOTIFICATION_CONTAINER_ID);
        },
    });
};
