import { INotificationProperties } from '@vfde-brix/ws10/notification';
import {
    ADDITIONAL_PAGE_OPTIONS,
    SAILS_PARAM_TRADE_IN,
    SAILS_VVL_STORAGE,
} from '@vfde-sails/constants';
import {
    getSessionStorageItemJson,
    SailsVvlStorage,
} from '@vfde-sails/storage';
import { SAILS_PARAM_TRADE_IN_DEVICE } from '../features/TradeIn/constants';
import { Device } from '../features/TradeIn/interfaces/api';
import { SailsDeviceDetailsStorage } from '../interfaces/storage';
import { RootState } from 'src/app/store';
import {
    selectHasError,
    selectIsDeviceNotFound,
} from '../features/TradeIn/selectors';

/**
 * Get isTradeIn from storage
 */
export const getIsTradeIn = (): boolean => {
    const storage = getSessionStorageItemJson<SailsVvlStorage>(SAILS_VVL_STORAGE);
    const isTradeIn = storage?.[SAILS_PARAM_TRADE_IN] ?? false;

    return isTradeIn;
};

/**
 * Get tradeIn device from session storage
 */
export const getTradeInDeviceFromStorage = (): Device | null => {
    const storage = getSessionStorageItemJson<SailsDeviceDetailsStorage | null>(SAILS_VVL_STORAGE);

    return storage?.[SAILS_PARAM_TRADE_IN_DEVICE] || null;
};

/**
 * Get tradeIn suggestion input notification properties from additionalPageOptions
 */
export const getTradeInSuggestInputNotificationContent = (state:RootState): Partial<INotificationProperties> => {
    const hasError = selectHasError(state);
    const isDeviceNotFound = selectIsDeviceNotFound(state);
    const notificationProperties: Partial<INotificationProperties> = {};

    const { tradeIn } = window[ADDITIONAL_PAGE_OPTIONS]?.promos || {};

    if (hasError) {
        // show API error notification
        notificationProperties.optState = 'error';
        notificationProperties.txtContent =
        tradeIn?.technicalErrorText || '';
    }
    else if (isDeviceNotFound) {
        // show 'device not found' notification
        notificationProperties.optState = 'info';
        notificationProperties.txtContent =
        tradeIn?.deviceNotFoundText || '';
    }

    return notificationProperties;
};

