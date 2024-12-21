import {
    INotificationProperties,
    Notification,
} from '@vfde-brix/ws10/notification';
import { toggleElementById } from '../../../helpers/domHelper';
import { mountNotification } from '../../../components/Notification';
import {
    getGigakombiType,
    getIsGigakombiEligible,
} from '../../../helpers/getUserDataHelper';
import { GIGAKOMBI_IP } from '@vfde-sails/constants';
import { CONTAINER_GIGAKOMBI_NOTIFICATION } from '../../App/constants';
import {
    getGigakombiNotificationProperties,
    getGigakombiNotificationText,
} from '../../../helpers/gigaKombiNotificationHelper';

/**
 * mountgigakombiNotification
 */
export const mountGigakombiNotification = (containerId: string) => {
    const gigakombiNotification = mountNotification(containerId);

    /* istanbul ignore if */
    if (!gigakombiNotification) {
        return null;
    }

    const isGigakombiEligible = getIsGigakombiEligible();
    const gigakombiType = getGigakombiType();
    const isGigaKombiIp = gigakombiType === GIGAKOMBI_IP;

    if (isGigakombiEligible || !isGigaKombiIp) {
        toggleElementById(CONTAINER_GIGAKOMBI_NOTIFICATION, false);
        const gigaKombiNotificationTxt = getGigakombiNotificationText(gigakombiType!);
        const gigaKombiNotificationProps = getGigakombiNotificationProperties(gigaKombiNotificationTxt!, gigakombiType!);
        updateGigakombiNotification(gigaKombiNotificationProps, gigakombiNotification!, CONTAINER_GIGAKOMBI_NOTIFICATION);
    }

    return gigakombiNotification;
};

/**
 * Update the notification's content and state to match the current gk type
 */
const updateGigakombiNotification = (notificationProps: Partial<INotificationProperties>, notification: Notification, notificationId: string): void => {
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
