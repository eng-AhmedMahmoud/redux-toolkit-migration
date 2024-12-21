import {
    SAILS_PARAM_DEVICE_ID,
    SAILS_PARAM_SALESCHANNEL,
    SAILS_PARAM_TAUSCHBONUS,
    SAILS_PARAM_TRADE_IN,
    SAILS_VVL_STORAGE,
    SalesChannel,
    URL_PARAM_SUBGROUP_ID,
} from '@vfde-sails/constants';
import { startAppListening } from '../../app/listener';
import { getDefaultState } from './helpers/getDefaultState';
import {
    setDefaultState,
    setSalesChannel,
} from './slice';
import {
    SailsVvlStorage,
    updateStorage,
} from '@vfde-sails/storage';
import {
    redirectToDop,
    redirectToPage,
} from '../../helpers/redirectToHelper';
import { PayloadAction } from '@reduxjs/toolkit';
import {
    createUrlWithQueryString,
    hasQueryParam,
    updateUrl,
} from '@vfde-sails/utils';
import { startAuthentication } from '@vfde-sails/vvl';
import {
    goToBasket,
    goToFamilyCard,
} from './slice';
import { generateDeeplinkHelper } from '../../helpers/generateDeeplinkHelper';
import { getHardwareDetailGroup } from '../../api/glados';
import { initOptions } from '../Options';

export const listeners = {
    /**
     * Adds the listener for the `startVVLAuthentication.fulfilled` case.
     */
    startAuthenticationFulfilled: () => startAppListening({
        actionCreator: startAuthentication.fulfilled,
        effect: (_action, listenerApi) => {
            const cleanedCustomerData = JSON.parse(JSON.stringify(_action.payload));
            const defaultState = { ...getDefaultState(), ...cleanedCustomerData! };
            listenerApi.dispatch(setDefaultState(defaultState));
        },
    }),
    startAuthenticationRejected: () => startAppListening({
        actionCreator: startAuthentication.rejected,
        effect: _action => {
            redirectToPage(_action.payload!);
        },
    }),
    setDefaultState: () => startAppListening({ actionCreator: setDefaultState,
        effect: _action => {
            const { salesChannel, deviceId, isTradeIn, isTauschbonusEligible } = _action.payload;

            updateStorage<SailsVvlStorage>(
                SAILS_VVL_STORAGE,
                { [SAILS_PARAM_SALESCHANNEL]: salesChannel!,
                    [SAILS_PARAM_DEVICE_ID]: deviceId!,
                    [SAILS_PARAM_TRADE_IN]: isTradeIn,
                    [SAILS_PARAM_TAUSCHBONUS]: isTauschbonusEligible && isTradeIn },
            );

            deviceId ? initOptions() : redirectToDop();
        } }),
    setSalesChannel: () => startAppListening({
        actionCreator: setSalesChannel,
        effect: (action: PayloadAction<SalesChannel>, listenerApi)=>{
            const salesChannel = action.payload;

            // Delete tariffId parameter when exists
            if (hasQueryParam(URL_PARAM_SUBGROUP_ID)) {
                updateUrl(createUrlWithQueryString(URL_PARAM_SUBGROUP_ID, ''));
            }

            updateStorage<SailsVvlStorage>(
                SAILS_VVL_STORAGE,
                { [SAILS_PARAM_SALESCHANNEL]: salesChannel });
            // Call getHardwareDetailGroup function from the options slice
            listenerApi.dispatch(getHardwareDetailGroup.initiate({ salesChannel }));
        },
    }),
    goToBasket: () => startAppListening({
        actionCreator: goToBasket,
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const basketDeeplink = generateDeeplinkHelper(state);

            window.location.assign(basketDeeplink);
        },
    }),
    goToFamilyCard: () => startAppListening({
        actionCreator: goToFamilyCard,
        effect: () => {
            const { offerSummaryCard } = (window as any).additionalPageOptions;
            const familyCardLink = offerSummaryCard?.familyCardLink;
            window.location.assign(familyCardLink);
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
