import { requestHtml } from '@vfde-sails/utils';
import {
    call,
    put,
    StrictEffect,
    takeLatest,
} from 'redux-saga/effects';
import {
    GET_OVERLAY_CONTENT,
    OPEN_OVERLAY,
} from './constants';
import { Overlay } from '@vfde-brix/ws10/overlay';
import { ACCORDION_BASE_CLASSNAME } from '@vfde-brix/ws10/accordion';
import { mountAccordion } from '../../components/Accordion';
import {
    getOverlayContent,
    openOverlay,
} from './actions';
import {
    trackError,
    trackOverlayReveal,
} from '../App/helpers/tracking';
import { TrackingErrorType } from '@vfde-sails/tracking';

/**
 * Overlay main saga
 */
export default function* overlaySaga (): Generator<StrictEffect> {
    yield takeLatest(GET_OVERLAY_CONTENT, getOverlayContentSaga);
    yield takeLatest(OPEN_OVERLAY, openOverlaySaga);
}

/**
 * Get overlay content from URL
 */
export function* getOverlayContentSaga (action: ReturnType<typeof getOverlayContent>): Generator<StrictEffect> {
    try {
        const { href, overlay } = action;

        const response = (yield call(requestHtml, href, {
            encoder: 'iso-8859-1',
        })) as Awaited<ReturnType<typeof requestHtml>>;

        yield call(mountOverlayContentSaga, response, overlay);

        yield put(openOverlay(overlay));
    }
    catch (err: any) {
        yield call(trackError, {
            type: TrackingErrorType.Tarifeechnical,
            message: err.message,
            location: 'getOverlayContent',
        });
        // eslint-disable-next-line no-console
        console.log(err);
    }
}

/**
 * Mount components
 */
export function* mountOverlayContentSaga (html: string, overlay: Overlay): Generator<StrictEffect> {

    const overlayContent = (new DOMParser()).parseFromString(html, 'text/html');

    overlayContent.querySelectorAll(`.${ACCORDION_BASE_CLASSNAME}`).forEach(accordion => {
        mountAccordion(accordion.parentElement!);
    });

    yield call([overlay, 'injectContent'], ...overlayContent.getElementsByTagName('body')[0].children);
}

/**
 * Open overlay
 */
export function* openOverlaySaga (action: ReturnType<typeof openOverlay>): Generator<StrictEffect> {
    yield call([action.overlay, 'open']);
    yield call(trackOverlayReveal);
}
