import { NOTIFICATION_COLOR_WHITE } from '@vfde-brix/ws10/notification/Constants';
import { INotificationProperties } from '@vfde-brix/ws10/notification/NotificationInterface';
import {
    ADDITIONAL_PAGE_OPTIONS,
    GIGAKOMBI_BR5,
    GigakombiType,
} from '@vfde-sails/constants';
import { NotificationIconStates } from '@vfde-brix/ws10/notification-icon/Constants';

/**
 * Read out from the window object the correct notification text
 */
export const getGigakombiNotificationText = (
    gigakombiType: GigakombiType,
): string | undefined => {
    const notifications = window[ADDITIONAL_PAGE_OPTIONS].gigaKombiNotification;

    return notifications[gigakombiType];

};

/**
 * Returns all updated notification properties
 */
export const getGigakombiNotificationProperties = (
    txtContent : string,
    gigakombiType: GigakombiType,
): INotificationProperties => {
    const notificationState = gigakombiType === GIGAKOMBI_BR5 ? NotificationIconStates?.NotificationInfo : NotificationIconStates?.NotificationWarn;

    const props: INotificationProperties = {
        optState: notificationState,
        txtContent,
        optBackground: NOTIFICATION_COLOR_WHITE,
        business: {},
    };

    return props;
};
