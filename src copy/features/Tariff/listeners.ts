import { getTariffWithHardware } from '../../api/glados';
import { startAppListening } from '../../app/listener';
import { selectSubscriptionId } from './selectors';
import {
    setDefaultState,
    setSubscriptionId,
} from './slice';
import { getSubscriptionId } from '../../helpers/getUserDataHelper';
import { selectActiveOffers } from './selectors';
import { checkSubscriptionIdExistsInSubscriptions } from '../../helpers/tariffOptionPickerHelpers';
import {
    RedTariff,
    SAILS_PARAM_SUB_ID,
    SAILS_VVL_STORAGE,
    URL_PARAM_SUBGROUP_ID,
    YoungTariff,
} from '@vfde-sails/constants';
import {
    createUrlWithQueryString,
    hasQueryParam,
    updateUrl,
} from '@vfde-sails/utils';
import {
    getSessionStorageItemJson,
    SailsVvlStorage,
    updateStorage as updateStorageHelper,
} from '@vfde-sails/storage';
import { selectSalesChannel } from '../App/selectors';
import { isAnyOf } from '@reduxjs/toolkit';
import { setSalesChannel } from '../App/slice';
import { createTrackingData } from '../App/helpers/tracking';

export const listeners = {
    /**
     * Adds the listener for the `getTariffWithHardware.matchFulfilled` case.
     */
    getSubscriptionsFulfilled: () => startAppListening({
        matcher: getTariffWithHardware.matchFulfilled,
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const subscriptionId = selectSubscriptionId(state);

            createTrackingData(state);
            const offers = selectActiveOffers(state);

            if (!checkSubscriptionIdExistsInSubscriptions(subscriptionId!, offers!)) {
                offers && listenerApi.dispatch(setSubscriptionId(offers[offers.length - 1].virtualItemId as RedTariff | YoungTariff));
            }
        },
    }),

    /**
     * Adds the listener for `setDefaultState, setSalesChannel` actions.
     */
    setSubscriptionId: () => startAppListening({
        matcher: isAnyOf(setDefaultState, setSalesChannel),
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const salesChannel = selectSalesChannel(state);

            if (salesChannel) {
                const subscriptionId = getSubscriptionId(salesChannel);
                subscriptionId && listenerApi.dispatch(setSubscriptionId(subscriptionId, true, false));
            }
        },
    }),

    /**
     * Adds the listener for `setSubscriptionId` action.
     */
    setSubscriptionIdInStorage: () => startAppListening({
        actionCreator: setSubscriptionId,
        effect: (action, listenerApi) => {
            const { subscriptionId, updateStorage, shouldTrackPageView } = action.payload;

            const state = listenerApi.getState();
            const salesChannel = selectSalesChannel(state);

            // Update parameter when exists
            if (hasQueryParam(URL_PARAM_SUBGROUP_ID)) {
                updateUrl(createUrlWithQueryString(URL_PARAM_SUBGROUP_ID, subscriptionId), true);
            }

            if (updateStorage && salesChannel) {
                updateStorageHelper<SailsVvlStorage>( SAILS_VVL_STORAGE, {
                    [SAILS_PARAM_SUB_ID]: {
                        [salesChannel]: subscriptionId,
                    },
                }, getSessionStorageItemJson(SAILS_VVL_STORAGE), { shouldDeepMerge: true });
            }

            if (shouldTrackPageView) {
                createTrackingData(state);
            }
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
