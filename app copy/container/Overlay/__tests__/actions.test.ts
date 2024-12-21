import {
    GET_OVERLAY_CONTENT,
    OPEN_OVERLAY,
} from '../constants';
import {
    getOverlayContent,
    openOverlay,
} from '../actions';
import { Overlay } from '@vfde-brix/ws10/overlay';

describe('Overlay actions', () => {
    describe('getOverlayContent', function () {
        it('should return the correct type', () => {
            const overlay = {} as unknown as Overlay;
            const expected = {
                type: GET_OVERLAY_CONTENT,
                overlay,
                href: 'foo',
            };

            expect(getOverlayContent('foo', overlay)).toEqual(expected);
        });
    });

    describe('openOverlay', () => {
        it('should return the correct type', () => {
            const overlay = {} as unknown as Overlay;
            const expected = {
                type: OPEN_OVERLAY,
                overlay,
            };

            expect(openOverlay(overlay)).toEqual(expected);
        });
    });
});
