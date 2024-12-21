import overlaySaga, {
    getOverlayContentSaga,
    mountOverlayContentSaga,
    openOverlaySaga,
} from '../saga';
import {
    call,
    put,
    takeLatest,
} from 'redux-saga/effects';
import {
    GET_OVERLAY_CONTENT,
    OPEN_OVERLAY,
} from '../constants';
import { openOverlay } from '../actions';
import { Overlay } from '@vfde-brix/ws10/overlay';
import { TrackingErrorType } from '@vfde-sails/tracking';
import {
    trackError,
    trackOverlayReveal,
} from '../../../container/App/helpers/tracking';

jest.mock('@vfde-brix/ws10/accordion', () => ({
    ACCORDION_BASE_CLASSNAME: 'ws10-accordion',
}));

jest.mock('@vfde-brix/ws10/headline', () => ({
    HEADLINE_BASE_CLASSNAME: 'ws10-headline',
}));

jest.mock('@vfde-brix/ws10/core', () => ({
    /* eslint-disable @typescript-eslint/naming-convention, camelcase */
    NO_PATTERN_BUSINESS_LOGIC: {},
    /* eslint-enable @typescript-eslint/naming-convention, camelcase */
}));

jest.mock('@vfde-brix/ws10/table', () => ({
    /* eslint-disable @typescript-eslint/naming-convention, camelcase */
    ITableProperties: {},
    Table: {},
    /* eslint-enable @typescript-eslint/naming-convention, camelcase */
}));

jest.mock('@vfde-brix/ws10/styles', () => ({
    CLASSNAME_HIDDEN: 'foo',
}));

jest.mock('@vfde-brix/ws10/option-picker', () => ({
    OPTION_PICKER_INPUT_CLASSNAME: 'foo',
}));

describe('Overlay sagas', () => {
    describe('overlaySaga', () => {
        const generator = overlaySaga();

        it('should start watch tasks in the correct order', () => {
            expect(generator.next().value).toEqual(takeLatest(GET_OVERLAY_CONTENT, getOverlayContentSaga));
            expect(generator.next().value).toEqual(takeLatest(OPEN_OVERLAY, openOverlaySaga));
            expect(generator.next().done).toBe(true);
        });
    });

    describe('getOverlayContentSaga', () => {
        let generator: Generator;
        const injectContent = jest.fn();
        const overlay = {
            injectContent,
        } as unknown as Overlay;

        beforeEach(() => {
            generator = getOverlayContentSaga({
                type: GET_OVERLAY_CONTENT,
                href: 'foo',
                overlay,
            });
        });

        it('should fetch HTML, mount components and trigger overlay open action', () => {
            generator.next();
            expect(generator.next('<foo>').value).toEqual(call(mountOverlayContentSaga, '<foo>', overlay));
            expect(generator.next().value).toEqual(put(openOverlay(overlay)));
            expect(generator.next().done).toBe(true);
        });

        it('should handle error', () => {
            const error = new Error('I am dead');
            const consoleMock = jest.spyOn(console, 'log');

            generator.next();

            expect(generator.throw!(error).value).toEqual(call(trackError, {
                type: TrackingErrorType.Tarifeechnical,
                message: error.message,
                location: 'getOverlayContent',
            }));

            expect(generator.next().done).toBe(true);
            expect(consoleMock).toBeCalledWith(error);
        });
    });

    describe('mountOverlayContentSaga', () => {
        let generator: Generator;
        const injectContent = jest.fn();
        const overlay = {
            injectContent,
        } as unknown as Overlay;

        beforeEach(() => {
            generator = mountOverlayContentSaga( '<foo/>', overlay);
        });

        it('should inject content', () => {
            expect(generator.next([]).value).toEqual(call([overlay, 'injectContent'], expect.anything()));
            expect(generator.next().done).toBe(true);
        });
    });

    describe('openOverlaySaga', () => {
        let generator: Generator;
        jest.mock('../actions', () => ({
            __esModule: true,
            openOverlay: jest.fn(),
        }));
        const overlay = {
            open: openOverlay,
        } as unknown as Overlay;

        beforeEach(() => {
            generator = openOverlaySaga({
                type: OPEN_OVERLAY,
                overlay,
            });
        });

        it('should open and track the overlay', () => {
            expect(generator.next().value).toEqual(call([overlay, 'open']));
            expect(generator.next().value).toEqual(call(trackOverlayReveal));
            expect(generator.next().done).toBe(true);
        });
    });
});
