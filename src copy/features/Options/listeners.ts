import { decodeHtml } from '@vfde-sails/utils';
import { startAppListening } from '../../app/listener';
import {
    setDefaultState,
    changeCapacity,
    changeColor,
    setAtomicId,
    toggleAccordionItem,
    setDevicePayload,
} from './slice';
import {
    selectAtomicDevices,
    selectAtomicId,
    selectCapacitiesForColor,
    selectCurrentCapacity,
    selectCurrentColor,
} from './selectors';
import {
    TRACKING_INFORMATION_ACTION_REVEAL,
    TrackType,
    TrackingInformationTrigger,
    TrackingInformationUiType,
    trackIt,
} from '@vfde-sails/tracking';
import {
    SAILS_PARAM_ATOMIC_ID,
    SAILS_VVL_STORAGE,
    SalesChannel,
} from '@vfde-sails/constants';
import { getNewSelectedCapacity } from './helpers/capacityHelper';
import {
    getHardwareDetailGroup,
    getTariffWithHardware,
} from '../../api/glados';
import {
    getSessionStorageItemJson,
    updateStorage,
} from '@vfde-sails/storage';
import { redirectToDop } from '../../helpers/redirectToHelper';
import { createTrackingData } from '../App/helpers/tracking';
import { selectDeviceId } from '../App/selectors';
import {
    selectSalesChannel,
    selectIsTradeIn,
} from '../../features/App/selectors';
import { selectActiveOffer } from '../Tariff/selectors';
export const listeners = {
    /**
     * Adds the listener for the `setDefaultState` case.
     * It then initiates the `getHardwareDetailGroup` request.
     */
    setDefaultState: () => startAppListening({
        actionCreator: setDefaultState,
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const deviceId = selectDeviceId(state);
            const salesChannel = selectSalesChannel(state) as SalesChannel;
            deviceId ? listenerApi.dispatch(getHardwareDetailGroup.initiate({ salesChannel })) : redirectToDop();
        },
    }),
    /**
     * Adds the listener for the `getHardwareDetailGroup.matchFulfilled` case.
     * It then checks if the user has selected a tariff ID and initiates the `getTariffWithHardware` request.
     */
    getDeviceFulfilled: () => startAppListening({
        matcher: getHardwareDetailGroup.matchFulfilled,
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();

            const atomicId = selectAtomicId(state);
            listenerApi.dispatch(setAtomicId(atomicId));

            const salesChannel = selectSalesChannel(state) as SalesChannel;
            const isTradeIn = selectIsTradeIn(state);

            const devicePayload = _action.payload;
            listenerApi.dispatch(setDevicePayload(devicePayload));

            listenerApi.dispatch(getTariffWithHardware.initiate({ salesChannel, isTradeIn }));
        },
    }),
    /**
     * Adds the listener for the `changeColor` action.
     * Based on the new color, a new capacity is selected.
     */
    changeColor: () => startAppListening({
        actionCreator: changeColor,
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const currentCapacity = selectCurrentCapacity(state);
            const capacitiesForColor = selectCapacitiesForColor(state);
            const newCapacity = getNewSelectedCapacity(capacitiesForColor!, currentCapacity!);

            listenerApi.dispatch(changeCapacity(newCapacity.sortValue));
        },
    }),
    /**
     * Adds the listener for the `changeCapacity` action.
     * Based on the current color and capacity the new atomic is selected using the `setAtomicId` action.
     */
    changeCapacity: () => startAppListening({
        actionCreator: changeCapacity,
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const currentColor = selectCurrentColor(state);
            const currentCapacity = selectCurrentCapacity(state);
            const atomics = selectAtomicDevices(state);

            const newAtomicDevice = atomics!
                .filter(atomic => {
                    const { capacity, color } = atomic;

                    return color.displayLabel === currentColor?.displayLabel && capacity.sortValue === currentCapacity?.sortValue;
                })[0];

            listenerApi.dispatch(setAtomicId(newAtomicDevice.hardwareId));
        },
    }),
    /**
     * Adds the listener for the `setAtomicId` action.
     * It updates the URL (if needed) and tracks a pageview event.
     */
    setAtomicId: () => startAppListening({
        actionCreator: setAtomicId,
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const atomicId = selectAtomicId(state);

            // update storage with the new atomicId
            updateStorage(SAILS_VVL_STORAGE, {
                [SAILS_PARAM_ATOMIC_ID]: atomicId,
            }, getSessionStorageItemJson(SAILS_VVL_STORAGE), { shouldDeepMerge: true });

            // trigger tracking
            const activeOffer = selectActiveOffer(state);
            activeOffer && createTrackingData(state);
        },
    }),
    /**
     * Adds the listener for the `toggleAccordionItem` action.
     * It tracks a pageview event.
     */
    toggleAccordionItem: () => startAppListening({
        actionCreator: toggleAccordionItem,
        effect: action => {
            if (!action.payload.optOpen) {
                return;
            }

            const trackingPayload = {
                /* eslint-disable camelcase, @typescript-eslint/naming-convention */
                information_action: TRACKING_INFORMATION_ACTION_REVEAL,
                information_ui_type: TrackingInformationUiType.Faq,
                information_trigger: TrackingInformationTrigger.Accordion,
                information_name: decodeHtml(action.payload.stdHeadline),
            };

            trackIt(
                TrackType.Information,
                trackingPayload,
            );
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
