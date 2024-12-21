import {
    all,
    call,
    put,
    select,
    StrictEffect,
    takeLatest,
} from 'redux-saga/effects';
import type { SelectorReturnType } from '@vfde-sails/core';
import {
    selectIsTradeInSelected,
    selectSelectedTradeInDevice,
    selectTradeIn,
    selectTradeInInputValue,
} from './selectors';
import {
    deleteSelectedTradeInDevice,
    getTradeInDevices,
    getTradeInDevicesFailed,
    getTradeInDevicesSuccess,
    setIsTradeInSelected,
    setSelectedTradeInDeviceId,
} from './slice';
import { setIsTradeIn } from '../App/slice';
import { getTradeInTrackingPayload } from '../App/helpers/tracking';
import { trackIt } from '@vfde-sails/tracking';
import {
    getApiConfig,
    getQueryParam,
    requestJson,
    sanitizeInput,
} from '@vfde-sails/utils';
import {
    API_CREDENTIALS,
    SAILS_PARAM_TRADE_IN_DEVICE,
    TRADE_IN_API_QUERY_PARAM,
    TRADEIN_INPUT_MAX_LENGTH,
    TRADEIN_INPUT_MIN_LENGTH,
} from './constants';
import {
    ApiDevice,
    ApiResponse,
} from './interfaces/api';
import { filterAndFormatDevices } from './helpers/filterAndFormatDevices';
import {
    getSessionStorageItemJson,
    SailsVvlStorage,
    updateStorage,
} from '@vfde-sails/storage';
import {
    SAILS_PARAM_TAUSCHBONUS,
    SAILS_PARAM_TRADE_IN,
    SAILS_VVL_STORAGE,
} from '@vfde-sails/constants';
import { SailsDeviceDetailsStorage } from '../App/interfaces/storage';
import { selectIsTauschbonusEligible } from 'Container/App/selectors';
import { selectSubscriptionId } from 'Container/Tariff/selectors';
import { getSubscriptions } from 'Container/Tariff/slice';

/**
 * Tariff saga
 * Watches actions
 */
export default function* tradeInSaga (): Generator<StrictEffect> {
    yield takeLatest(setIsTradeInSelected.type, setIsTradeInSelectedSaga);
    yield takeLatest(getTradeInDevices.type, getTradeInDevicesSaga);
    yield takeLatest(setSelectedTradeInDeviceId.type, selectTradeInDeviceSaga);
    yield takeLatest(deleteSelectedTradeInDevice.type, deleteSelectedTradeInDeviceSaga);
    yield takeLatest(setIsTradeIn.type, handleSetTradeInSaga);
}

/**
 * Toggle Trade-in saga
 */
export function* setIsTradeInSelectedSaga (): Generator<StrictEffect> {
    // reset the devices array to the default value if trade-in switch was deactivated
    const [
        isTradeInSelected,
        isTradeIn,
        selectedTradeInDevice,
    ] = (yield all([
        select(selectIsTradeInSelected()),
        select(selectTradeIn()),
        select(selectSelectedTradeInDevice()),
    ])) as [
        SelectorReturnType<typeof selectIsTradeInSelected>,
        SelectorReturnType<typeof selectTradeIn>,
        SelectorReturnType<typeof selectSelectedTradeInDevice>,
    ];

    const isTradeInAndHasSelectedDevice = !!(isTradeInSelected && selectedTradeInDevice);

    const {
        trackingType,
        trackingPayload,
    } = (yield call(getTradeInTrackingPayload, isTradeInSelected, selectedTradeInDevice)) as ReturnType<typeof getTradeInTrackingPayload>;

    yield put(setIsTradeIn(isTradeIn));
    yield call(trackIt, trackingType, trackingPayload);

    // trade-in switch was deactivated,
    // reset the devices array to the default value (which is either the already selected device or null)
    // so that the 'device not found' / error notification will disappear
    !isTradeInAndHasSelectedDevice ? yield put(getTradeInDevicesSuccess(selectedTradeInDevice ? [selectedTradeInDevice] : null)) : null;
}

/**
 * getDevices saga
 * Fetches the API data
 */
export function* getTradeInDevicesSaga (): Generator<StrictEffect> {
    const suggestInputValue = (yield select(
        selectTradeInInputValue(),
    )) as SelectorReturnType<typeof selectTradeInInputValue>;
    const sanitizedInputValue = (yield call(
        sanitizeInput,
        suggestInputValue,
    )) as ReturnType<typeof sanitizeInput>;

    if (sanitizedInputValue.length < TRADEIN_INPUT_MIN_LENGTH) {
        // search input is too short, treat it as default case where response is null
        // Question: why do we need to dispatch anything at all in this case?
        // ANSWER: because the FormSuggestInput resultList needs to be refreshed (cleared) in that case
        yield put(getTradeInDevicesSuccess(null));

        return;
    }

    if (sanitizedInputValue.length > TRADEIN_INPUT_MAX_LENGTH) {
        // search input is too long, treat it as device not found
        yield put(getTradeInDevicesSuccess([]));

        return;
    }

    try {
        const { key, url } = getApiConfig(
            API_CREDENTIALS,
            /* dev-only-code:start */ !!getQueryParam('useMockedTradeInApi') ||
                !!getQueryParam('useMockedApi'), /* dev-only-code:end */
        );
        const requestUrl = `${url}?${TRADE_IN_API_QUERY_PARAM}=${encodeURIComponent(sanitizedInputValue)}`;
        const options = {
            method: 'GET',
            headers: {
                Authorization: `Basic ${key}`, // eslint-disable-line @typescript-eslint/naming-convention
                'Content-Type': 'application/json',
                'vf-country-code': 'DE',
                'vf-project': 'DLS',
            },
        };

        const response = (yield call(
            requestJson,
            requestUrl,
            options,
        )) as ApiResponse<ApiDevice[]>;

        const { body: apiDevices } = response;
        const devices = (yield call(
            filterAndFormatDevices,
            apiDevices,
        )) as ReturnType<typeof filterAndFormatDevices>;

        yield put(getTradeInDevicesSuccess(devices));
    }
    catch (e) {
        yield put(getTradeInDevicesFailed());
    }
}

/**
 * Select tradeIn device saga
 */
export function* selectTradeInDeviceSaga (): Generator<StrictEffect> {
    const selectedTradeInDevice = (yield select(
        selectSelectedTradeInDevice(),
    )) as SelectorReturnType<typeof selectSelectedTradeInDevice>;

    const isTauschbonusEligible = (yield select(
        selectIsTauschbonusEligible(),
    )) as SelectorReturnType<typeof selectIsTauschbonusEligible>;

    const { trackingType, trackingPayload } = (yield call(
        getTradeInTrackingPayload,
        true,
        selectedTradeInDevice,
    )) as ReturnType<typeof getTradeInTrackingPayload>;

    const hasTradeInDevice = !!selectedTradeInDevice;

    yield put(setIsTradeIn(!!hasTradeInDevice));

    if (hasTradeInDevice) {
        // track a tradeIn-reveal event on device selection (not on deselection)
        yield call(trackIt, trackingType, trackingPayload);
    }

    if (!selectedTradeInDevice) {
        return;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Intersect type isn't recognized here
    yield call(
        updateStorage<SailsDeviceDetailsStorage>,
        SAILS_VVL_STORAGE,
        {
            [SAILS_PARAM_TRADE_IN]: true,
            [SAILS_PARAM_TAUSCHBONUS]: isTauschbonusEligible && !!selectedTradeInDevice,
            [SAILS_PARAM_TRADE_IN_DEVICE]: selectedTradeInDevice,
        },
        getSessionStorageItemJson(SAILS_VVL_STORAGE),
        { shouldDeepMerge: false },
    );
}

/**
 * delete selected device
 */
export function* deleteSelectedTradeInDeviceSaga (): Generator<StrictEffect> {
    yield put(setIsTradeIn(false));

    const {
        trackingType,
        trackingPayload,
    } = (yield call(getTradeInTrackingPayload, true, null)) as ReturnType<typeof getTradeInTrackingPayload>;

    yield call(trackIt, trackingType, trackingPayload);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Intersect type isn't recognized here
    yield call(
        updateStorage<SailsVvlStorage | SailsDeviceDetailsStorage>,
        SAILS_VVL_STORAGE,
        {
            [SAILS_PARAM_TRADE_IN]: false,
            [SAILS_PARAM_TAUSCHBONUS]: false,
            [SAILS_PARAM_TRADE_IN_DEVICE]: null,
        },
        getSessionStorageItemJson(SAILS_VVL_STORAGE),
        { shouldDeepMerge: false },
    );
}

/**
 * Trigger tariff API again to fetch tauschbonus discount (if device is tauschbonus eligible)
 */
export function* handleSetTradeInSaga (): Generator<StrictEffect> {
    const [isTauschbonusEligible, subscriptionId] = (yield all([
        select(selectIsTauschbonusEligible()),
        select(selectSubscriptionId()),
    ])) as [
        SelectorReturnType<typeof selectIsTauschbonusEligible>,
        SelectorReturnType<typeof selectSubscriptionId>,
    ];

    if (isTauschbonusEligible && subscriptionId) {
        (yield put(getSubscriptions()));
    }
}
