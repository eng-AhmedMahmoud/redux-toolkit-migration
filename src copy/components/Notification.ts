import {
    createNotification,
    Notification,
} from '@vfde-brix/ws10/notification';
import { NO_PATTERN_BUSINESS_LOGIC } from '@vfde-brix/ws10/core';

/**
 * Mounts a Notification
 */
export const mountNotification = (containerId: string): Notification | null => {
    const container = document.getElementById(containerId);

    /* istanbul ignore if */
    if (!container) {
        return null;
    }

    const notification = createNotification(container, NO_PATTERN_BUSINESS_LOGIC);

    return notification;
};
