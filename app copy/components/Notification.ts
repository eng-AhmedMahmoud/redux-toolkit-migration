import {
    createNotification,
    INotificationProperties,
    Notification,
} from '@vfde-brix/ws10/notification';
import { NO_PATTERN_BUSINESS_LOGIC } from '@vfde-brix/ws10/core';
import { toggleElementById } from 'Helper/domHelper';

/**
 * mountNotification
 */
export const mountNotification = (id: string): Notification | null => {
    const container = document.getElementById(id);

    return container && createNotification(container, NO_PATTERN_BUSINESS_LOGIC);
};

/**
 * Update the notification's content and state to match the current gk type
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
