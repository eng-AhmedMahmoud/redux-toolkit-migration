/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/naming-convention */
import {
    ADDITIONAL_PAGE_OPTIONS,
    GIGAKOMBI_BR5,
    GIGAKOMBI_IP_TV,
    GIGAKOMBI_TV,
    GigakombiType,
} from '@vfde-sails/constants';
import {
    getGigakombiNotificationProperties,
    getGigakombiNotificationText,
} from './../gigaKombiNotificationHelper';
import { AdditionalPageOptions } from '../../features/App/interfaces/additionalPageOptions';
import { NOTIFICATION_COLOR_WHITE } from '@vfde-brix/ws10/notification/Constants';
import { NotificationIconStates } from '@vfde-brix/ws10/notification-icon/Constants';

jest.mock('@vfde-brix/ws10/notification-icon/Constants', () => ({
    NotificationIconStates: {},
}));

jest.mock('@vfde-brix/ws10/notification/Constants', () => ({
    NOTIFICATION_COLOR_WHITE: '',
}));
describe('getGigakombiNotificationText', () => {
    const originalWindow = { ...window };
    const br5 = 'BR5 notification';
    const ipAndTv = 'IP and TV notification';
    const tv = 'TV notification';

    beforeEach(() => {
        (window[ADDITIONAL_PAGE_OPTIONS] as Partial<AdditionalPageOptions>) = {
            gigaKombiNotification: {
                [GIGAKOMBI_BR5]: br5,
                [GIGAKOMBI_IP_TV]: ipAndTv,
                [GIGAKOMBI_TV]: tv,
            },
        };
    });

    afterEach(() => {
        window = originalWindow as any;
    });

    it('should return BR5 notification when gigakombiType is GIGAKOMBI_BR5', () => {
        expect(getGigakombiNotificationText(GIGAKOMBI_BR5)).toBe(br5);
    });

    it('should return IP and TV notification when gigakombiType is GIGAKOMBI_IP_TV', () => {
        expect(getGigakombiNotificationText(GIGAKOMBI_IP_TV)).toBe(ipAndTv);
    });

    it('should return TV notification when gigakombiType is GIGAKOMBI_TV', () => {
        expect(getGigakombiNotificationText(GIGAKOMBI_TV)).toBe(tv);
    });

    it('should return null when gigakombiType is not recognized', () => {
        expect(getGigakombiNotificationText('UNKNOWN_TYPE' as GigakombiType)).toBe(undefined);
    });
});

describe('getGigakombiNotificationProperties', () => {
    it('should return correct properties for GIGAKOMBI_BR5', () => {
        const props = getGigakombiNotificationProperties('Test message', GIGAKOMBI_BR5);
        expect(props).toEqual({
            optState: NotificationIconStates.NotificationInfo,
            txtContent: 'Test message',
            optBackground: NOTIFICATION_COLOR_WHITE,
            business: {},
        });
    });

    it('should return correct properties for other Gigakombi types', () => {
        const props = getGigakombiNotificationProperties('Another message', GIGAKOMBI_TV);
        expect(props).toEqual({
            optState: NotificationIconStates.NotificationWarn,
            txtContent: 'Another message',
            optBackground: NOTIFICATION_COLOR_WHITE,
            business: {},
        });
    });

    it('should handle empty text content', () => {
        const props = getGigakombiNotificationProperties('', GIGAKOMBI_BR5);
        expect(props).toEqual({
            optState: NotificationIconStates.NotificationInfo,
            txtContent: '',
            optBackground: NOTIFICATION_COLOR_WHITE,
            business: {},
        });
    });
});
