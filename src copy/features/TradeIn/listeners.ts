import { trackIt } from '@vfde-sails/tracking';
import { startAppListening } from '../../app/listener';
import { updateStorage } from '@vfde-sails/storage';
import { SAILS_PARAM_TRADE_IN_DEVICE } from './constants';
import {
    getSessionStorageItemJson,
    SailsVvlStorage,
} from '@vfde-sails/storage';
import {
    selectIsTradeInSelected,
    selectSelectedTradeInDevice,
    selectTradeIn,
} from './selectors';
import {
    deleteSelectedTradeInDevice,
    setDevices,
    setIsTradeInSelected,
    setSelectedTradeInDeviceId,
} from './slice';
import {
    SAILS_PARAM_TAUSCHBONUS,
    SAILS_PARAM_TRADE_IN,
    SAILS_VVL_STORAGE,
    SalesChannel,
} from '@vfde-sails/constants';
import { getTariffWithHardware } from '../../api/glados';
import {
    selectIsTauschbonusEligible,
    selectIsTradeIn,
    selectSalesChannel,
} from '../App/selectors';
import { selectSubscriptionId } from '../Tariff/selectors';
import { SailsDeviceDetailsStorage } from '../../interfaces/storage';
import { getTradeInTrackingPayload } from '../App/helpers/tracking';
import { setIsTradeIn } from '../App/slice';

// Listeners
export const listeners = {
    /**
     * Adds the listener for the `setIsTradeInSelected` action.
     * It then tracks and dispatches the `setIsTradeIn` action.
     */
    setIsTradeInSelected: () => startAppListening({
        actionCreator: setIsTradeInSelected,
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const isTradeInSelected = selectIsTradeInSelected(state);
            const selectedTradeInDevice = selectSelectedTradeInDevice(state);
            const isTradeIn = selectTradeIn(state);

            const isTradeInAndHasSelectedDevice = !!(isTradeInSelected && selectedTradeInDevice);

            const { trackingType, trackingPayload } = getTradeInTrackingPayload(isTradeInSelected, selectedTradeInDevice);

            listenerApi.dispatch(setIsTradeIn(isTradeIn));
            trackIt(trackingType, trackingPayload);

            // trade-in switch was deactivated,
            // reset the devices array to the default value (which is either the already selected device or null)
            // so that the 'device not found' / error notification will disappear
            !isTradeInAndHasSelectedDevice ? listenerApi.dispatch(setDevices(selectedTradeInDevice ? [selectedTradeInDevice] : null)) : null;
        },
    }),
    /**
     * Adds the listener for the `setSelectedTradeInDeviceId` action.
     * It then updates the storage, tracks the device selection
     * and dispatches the `setIsTradeIn` action.
     */
    setSelectedTradeInDeviceId: () => startAppListening({
        actionCreator: setSelectedTradeInDeviceId,
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const selectedTradeInDevice = selectSelectedTradeInDevice(state);
            const isTauschbonusEligible = selectIsTauschbonusEligible(state);

            const { trackingType, trackingPayload } = getTradeInTrackingPayload(true, selectedTradeInDevice);

            const hasTradeInDevice = !!selectedTradeInDevice;

            listenerApi.dispatch(setIsTradeIn(!!hasTradeInDevice));

            if (hasTradeInDevice) {
                // track a tradeIn-reveal event on device selection (not on deselection)
                trackIt(trackingType, trackingPayload);
            }

            if (!selectedTradeInDevice) {
                return;
            }

            updateStorage<SailsDeviceDetailsStorage>(
                SAILS_VVL_STORAGE,
                {
                    [SAILS_PARAM_TRADE_IN]: true,
                    [SAILS_PARAM_TAUSCHBONUS]: isTauschbonusEligible && !!selectedTradeInDevice,
                    [SAILS_PARAM_TRADE_IN_DEVICE]: selectedTradeInDevice,
                },
                getSessionStorageItemJson(SAILS_VVL_STORAGE),
                { shouldDeepMerge: false },
            );
        },
    }),
    /**
     * Adds the listener for the `deleteSelectedTradeInDevice` action.
     * It then updates the storage, tracks the device deletion
     * and dispatches the `setIsTradeIn` action.
     */
    deleteSelectedTradeInDevice: () => startAppListening({
        actionCreator: deleteSelectedTradeInDevice,
        effect: (_action, listenerApi) => {
            listenerApi.dispatch(setIsTradeIn(false));

            const { trackingType, trackingPayload } = getTradeInTrackingPayload(true, null);

            trackIt(trackingType, trackingPayload);

            updateStorage<SailsVvlStorage | SailsDeviceDetailsStorage>(
                SAILS_VVL_STORAGE,
                {
                    [SAILS_PARAM_TRADE_IN]: false,
                    [SAILS_PARAM_TAUSCHBONUS]: false,
                    [SAILS_PARAM_TRADE_IN_DEVICE]: null,
                },
                getSessionStorageItemJson(SAILS_VVL_STORAGE),
                { shouldDeepMerge: false },
            );

        },
    }),
    /**
     * Adds the listener for the `setIsTradeIn` action.
     * It then triggers tariff API to fetch tauschbonus discount if eligible.
     */
    setIsTradeIn: () => startAppListening({
        actionCreator: setIsTradeIn,
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const isTauschbonusEligible = selectIsTauschbonusEligible(state);
            const subscriptionId = selectSubscriptionId(state);

            if (isTauschbonusEligible && subscriptionId) {
                const salesChannel = selectSalesChannel(state) as SalesChannel;
                const isTradeIn = selectIsTradeIn(state);
                listenerApi.dispatch(
                    getTariffWithHardware.initiate({ salesChannel, isTradeIn }),
                );

            }
        },
    }),
};

/**
 * Starts all listeners
 */
export const startListeners = () => {
    const unsubscribeListeners = Object.values(listeners).map(listener => listener());

    return () => {
        unsubscribeListeners.forEach(unsubscribeListener => unsubscribeListener());
    };
};
