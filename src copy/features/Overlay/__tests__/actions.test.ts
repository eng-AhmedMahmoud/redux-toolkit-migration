import {
    GET_OVERLAY_CONTENT,
    MOUNT_OVERLAY,
    OPEN_OVERLAY,
} from '../constants';
import {
    getOverlayContent,
    mountOverlayContent,
    openOverlay,
} from '../actions';
import { Overlay } from '@vfde-brix/ws10/overlay';
import { requestHtml } from '@vfde-sails/utils';

describe('Overlay actions', () => {
    describe('getOverlayContent', function () {
        it('should return the correct type', () => {
            const overlay = {} as unknown as Overlay;
            const expected = {
                overlay,
                href: 'foo',
            };
            const action = getOverlayContent('foo', overlay);
            expect(action.type).toEqual(GET_OVERLAY_CONTENT);
            expect(action.payload).toEqual(expected);
        });
    });
    describe('mountOverlayContent', () => {
        it('should return the correct type', () => {
            const overlay = {} as unknown as Overlay;
            const response = {} as unknown as Awaited<ReturnType<typeof requestHtml>>;
            const action = mountOverlayContent(response, overlay);
            expect(action.type).toEqual(MOUNT_OVERLAY);
            expect(action.payload).toEqual({ response, overlay });

        });
    });
    describe('openOverlay', () => {
        it('should return the correct type', () => {
            const overlay = {} as unknown as Overlay;
            const action = openOverlay(overlay);
            expect(action.type).toEqual(OPEN_OVERLAY);
            expect(action.payload).toEqual({ overlay });

        });
    });
});
