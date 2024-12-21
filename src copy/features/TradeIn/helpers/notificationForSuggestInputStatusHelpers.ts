import {
    INotificationProperties,
    Notification,
} from '@vfde-brix/ws10/notification';
import { toggleElementById } from '../../../helpers/domHelper';

/**
 * Update the notification's content
 */
export const updateNotification = (notificationProps: Partial<INotificationProperties>, notification: Notification, notificationId: string): void => {
    if (!notificationProps.txtContent) {
        toggleElementById(notificationId, true);

        return;
    }

    toggleElementById(notificationId, false);

    notification.update({
        ...notification.getProperties(),
        ...notificationProps,
    });
};
