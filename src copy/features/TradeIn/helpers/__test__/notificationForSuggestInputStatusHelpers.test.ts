import {
    INotificationProperties,
    Notification,
} from '@vfde-brix/ws10/notification';
import { toggleElementById } from '../../../../helpers/domHelper';
import { updateNotification } from '../../helpers/notificationForSuggestInputStatusHelpers';

jest.mock('@vfde-brix/ws10/notification', () => ({
    Notification: jest.fn().mockImplementation(() => ({
        getProperties: jest.fn(),
        update: jest.fn(),
    })),
}));

jest.mock('../../../../helpers/domHelper', () => ({
    toggleElementById: jest.fn(),
}));

describe('updateNotification', () => {
    let notification: Notification;
    let mockElement: HTMLElement;
    let mockProperties: Partial<INotificationProperties>;
    const notificationId = 'test-notification-id';

    beforeEach(() => {
        mockElement = document.createElement('div');
        mockProperties = {};
        notification = new Notification(mockElement, mockProperties as INotificationProperties);
    });

    it('should toggle the notification to visible if txtContent is not provided', () => {
        mockProperties = {};

        updateNotification(mockProperties, notification, notificationId);

        expect(toggleElementById).toHaveBeenCalledWith(notificationId, true);
    });

    it('should toggle the notification to hidden if txtContent is provided', () => {
        mockProperties.txtContent = 'Sample notification content';

        updateNotification(mockProperties, notification, notificationId);

        expect(toggleElementById).toHaveBeenCalledWith(notificationId, false);
    });

    it('should update the notification with new properties if txtContent is provided', () => {
        const currentProperties = { txtContent: 'Old content' };
        (notification.getProperties as jest.Mock).mockReturnValue(currentProperties);
        mockProperties.txtContent = 'New content';

        updateNotification(mockProperties, notification, notificationId);

        expect(notification.getProperties).toHaveBeenCalled();
        expect(notification.update).toHaveBeenCalledWith({
            ...currentProperties,
            ...mockProperties,
        });
    });

    it('should not update the notification if txtContent is not provided', () => {
        updateNotification(mockProperties, notification, notificationId);

        expect(notification.getProperties).not.toHaveBeenCalled();
        expect(notification.update).not.toHaveBeenCalled();
    });
});
