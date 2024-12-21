import { ACCORDION_BASE_CLASSNAME } from '@vfde-brix/ws10/accordion';
import { TrackingErrorType } from '@vfde-sails/tracking';
import { requestHtml } from '@vfde-sails/utils';
import {
    getOverlayContent,
    mountOverlayContent,
    openOverlay,
} from './actions';
import {
    trackError,
    trackOverlayReveal,
} from '../App/helpers/tracking';
import { startAppListening } from '../../app/listener';
import { mountAccordion } from '../../components/Accordion';

export const listeners = {
    getOverlayContent: () => startAppListening({
        actionCreator: getOverlayContent,
        effect: async (action, listenerApi) => {
            try {
                const { dispatch } = listenerApi;
                const { href, overlay } = action.payload;

                const response = await requestHtml(href, {
                    encoder: 'iso-8859-1',
                }) as Awaited<ReturnType<typeof requestHtml>>;

                dispatch(mountOverlayContent(response, overlay));
                dispatch(openOverlay(overlay));
            }
            catch (err: any) {
                trackError( {
                    //  TODO  i used Technical instead of tariffTechnical recheck
                    type: TrackingErrorType.Technical,
                    message: err.message,
                    location: 'getOverlayContent',
                });
                // eslint-disable-next-line no-console
                console.log(err);
            }
        },
    }),
    mountOverlayContent: () => startAppListening({
        actionCreator: mountOverlayContent,
        effect: action => {
            const { response: html, overlay } = action.payload;

            const overlayContent = (new DOMParser()).parseFromString(html, 'text/html');

            overlayContent.querySelectorAll(`.${ACCORDION_BASE_CLASSNAME}`).forEach(accordion => {
                mountAccordion(accordion.parentElement!);
            });

            const bodyChildren = Array.from(overlayContent.getElementsByTagName('body')[0].children);
            const bodyChildrenStrings = bodyChildren.map(child => child.outerHTML);
            overlay.injectContent(...bodyChildrenStrings);
        },
    }),
    openOverlay: () => startAppListening({
        actionCreator: openOverlay,
        effect: action => {
            const { overlay } = action.payload;
            overlay.open();
            trackOverlayReveal();
        },
    }),
};

/**
 * Starts all listeners.
 * Returns a function to unsubscribe all listeners.
 */
export const startListeners = () => {
    const unsubscribeListeners = Object.values(listeners).map(listener => listener());

    return () => {
        unsubscribeListeners.forEach(unsubscribeListener => unsubscribeListener());
    };
};
