import { UnsubscribeListener } from '@reduxjs/toolkit';
import {
    mountOverlayContent,
    openOverlay,
} from '../actions';
import { listener } from '../../../app/listener';
import { Overlay } from '@vfde-brix/ws10/overlay';
import { requestHtml } from '@vfde-sails/utils';
import {
    listeners,
    startListeners,
} from '../listeners';
import {
    GET_OVERLAY_CONTENT,
    MOUNT_OVERLAY,
    OPEN_OVERLAY,
} from '../constants';
import { mountAccordion } from '../../../components/Accordion';
import { ACCORDION_BASE_CLASSNAME } from '@vfde-brix/ws10/accordion';
import {
    trackError,
    trackOverlayReveal,
} from '../../App/helpers/tracking';

jest.mock('@vfde-brix/ws10/accordion', () => ({
    ACCORDION_BASE_CLASSNAME: 'ws10-accordion',
}));

jest.mock('@vfde-brix/ws10/core', () => ({
    /* eslint-disable @typescript-eslint/naming-convention, camelcase */
    NO_PATTERN_BUSINESS_LOGIC: {},
    /* eslint-enable @typescript-eslint/naming-convention, camelcase */
}));

jest.mock('@vfde-sails/utils', () => ({
    requestHtml: jest.fn(),
}));

jest.mock('@vfde-sails/vvl', () => ({
    ...jest.requireActual('@vfde-sails/vvl'), // Preserve actual implementation
}));

jest.mock('@vfde-sails/validation', () => ({
    ...jest.requireActual('@vfde-sails/validation'), // Preserve actual implementation
}));

jest.mock('../../../components/Accordion');

jest.mock('../../App/helpers/tracking', () => ({
    trackError: jest.fn(),
    trackOverlayReveal: jest.fn(),
}));

describe('Overlay Listeners', () => {
    const originalLocation = window.location;

    afterEach(() => {
        jest.clearAllMocks(); // clear calls of mocks created with jest.mock
        jest.restoreAllMocks(); // restores implementation of spies created with jest.spyOn
        window.location = originalLocation;
    });

    test('startListeners', () => {
        expect(() => {
            startListeners()();
        }).not.toThrow();
    });

    describe('getOverlayContent listener', () => {
        let unsubscribe: UnsubscribeListener;

        beforeEach(() => {
            unsubscribe = listeners.getOverlayContent();
        });

        afterEach(() => {
            unsubscribe();
        });

        it('should dispatch mountOverlayContent and openOverlay when getOverlayContent is dispatched', async () => {

            const mockResponse = '<html>Mock HTML Response</html>';
            (requestHtml as jest.Mock).mockResolvedValue(mockResponse);
            const overlay = {} as unknown as Overlay;
            const payload = {
                href: 'https://example.com',
                overlay,
            };

            // Dispatch the getOverlayContent action
            const dispatchMock = jest.fn();

            listener.middleware({
                dispatch: dispatchMock,
                getState: jest.fn(),
            })(() => (action: any) => action)({
                type: GET_OVERLAY_CONTENT,
                payload,
            });

            // Wait for async listeners to finish
            await new Promise(resolve => setTimeout(resolve, 0));
            // Check dispatched actions

            expect(requestHtml).toHaveBeenCalledWith(payload.href, { encoder: 'iso-8859-1' });
            expect(dispatchMock).toHaveBeenCalledWith(expect.objectContaining({
                type: mountOverlayContent.type,
            }));
            expect(dispatchMock).toHaveBeenCalledWith(expect.objectContaining({
                type: openOverlay.type,
            }));
            expect(dispatchMock).toHaveBeenCalledWith(mountOverlayContent(mockResponse, payload.overlay));
            expect(dispatchMock).toHaveBeenCalledWith(openOverlay(payload.overlay));

        });

        it('should catch error when getOverlayContent is dispatched', async () => {
            const error = { message: 'I am dead' };

            (requestHtml as jest.Mock).mockImplementation(() => {
                throw new Error(error.message);
            });

            const overlay = {} as unknown as Overlay;
            const payload = {
                href: 'https://example.com',
                overlay,
            };

            // Dispatch the getOverlayContent action
            const dispatchMock = jest.fn();

            listener.middleware({
                dispatch: dispatchMock,
                getState: jest.fn(),
            })(() => (action: any) => action)({
                type: GET_OVERLAY_CONTENT,
                payload,
            });

            // Check dispatched actions
            const trackingError = {
                'location': 'getOverlayContent', 'message': error.message, 'type': 'technical',
            };
            expect(trackError).toHaveBeenCalled();
            expect(trackError).toHaveBeenCalledWith(trackingError);

        });
    });

    describe('mountOverlayContent listener', () => {
        let unsubscribe: UnsubscribeListener;

        beforeAll(() => {
            unsubscribe = listeners.mountOverlayContent();
        });

        afterAll(() => {
            unsubscribe();
        });

        it('should injectContent when mountOverlayContent is dispatched', async () => {
            const injectContent = jest.fn();
            const overlay = {
                injectContent,
            } as unknown as Overlay;

            const mockResponse = `<html>Mock HTML Response<div class="${ACCORDION_BASE_CLASSNAME}"></div></html>`;
            const payload = {
                response: mockResponse,
                overlay,
            };

            // Dispatch the getOverlayContent action
            const dispatchMock = jest.fn();

            listener.middleware({
                dispatch: dispatchMock,
                getState: jest.fn(),
            })(() => (action: any) => action)({
                type: MOUNT_OVERLAY,
                payload,
            });
            expect(mountAccordion).toHaveBeenCalled();

            const overlayContent = (new DOMParser()).parseFromString(mockResponse, 'text/html');

            overlayContent.querySelectorAll(`.${ACCORDION_BASE_CLASSNAME}`).forEach(accordion => {
                mountAccordion(accordion.parentElement!);
            });

            const bodyChildren = Array.from(overlayContent.getElementsByTagName('body')[0].children);
            const bodyChildrenStrings = bodyChildren.map(child => child.outerHTML);
            expect(overlay.injectContent).toHaveBeenCalledWith(...bodyChildrenStrings);

        });
    });

    describe('openOverlay listener', () => {
        let unsubscribe: UnsubscribeListener;

        beforeAll(() => {
            unsubscribe = listeners.openOverlay();
        });

        afterAll(() => {
            unsubscribe();
        });

        it('should open overlay when openOverlay is dispatched', async () => {
            const overlay = {
                open: jest.fn(),
            } as unknown as Overlay;

            const payload = {
                overlay,
            };

            // Dispatch the getOverlayContent action
            const dispatchMock = jest.fn();

            listener.middleware({
                dispatch: dispatchMock,
                getState: jest.fn(),
            })(() => (action: any) => action)({
                type: OPEN_OVERLAY,
                payload,
            });

            expect(overlay.open).toHaveBeenCalled();
            expect(trackOverlayReveal).toHaveBeenCalled();

        });
    });
});
