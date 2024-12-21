import {
    SYSTEM_ICON_5G,
    SYSTEM_ICON_5G_PLUS,
} from '@vfde-brix/ws10/system-icon';
import { getImageGalleryIcon } from '../getImageGalleryIcon';
import { Cellular } from '@vfde-sails/glados-v2';

/* eslint-disable @typescript-eslint/naming-convention, camelcase */

jest.mock('@vfde-brix/ws10/system-icon', () => ({
    SYSTEM_ICON_5G: 'foo',
    SYSTEM_ICON_5G_PLUS: 'bar',
}));

/* eslint-enable @typescript-eslint/naming-convention, camelcase */

describe('capacityHelper', () => {
    it('Should return 5g', () => {
        const expected = getImageGalleryIcon(Cellular.FiveG);
        expect(expected).toBe(SYSTEM_ICON_5G);
    });

    it('Should return 5g-plus', () => {
        const expected = getImageGalleryIcon(Cellular.FiveGPlus);
        expect(expected).toBe(SYSTEM_ICON_5G_PLUS);
    });

    it('Should return undefined', () => {
        const expected = getImageGalleryIcon('random' as Cellular);
        expect(expected).toBeUndefined();
    });
});
