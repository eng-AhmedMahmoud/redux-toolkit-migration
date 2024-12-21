import {
    all,
    put,
    select,
    takeLatest,
    call,
    StrictEffect,
} from 'redux-saga/effects';
import {
    selectCurrentCapacity,
    selectAtomicDevices,
    selectCapacitiesForColor,
    selectCurrentColor,
    selectAtomicId,
} from './selectors';

import {
    getSessionStorageItemJson,
    SailsVvlStorage,
    updateStorage,
} from '@vfde-sails/storage';
import {
    API_BTX_VVL,
    MAP_SALESCHANNEL_TO_API_SALESCHANNEL,
    SAILS_PARAM_ATOMIC_ID,
    SAILS_VVL_STORAGE,
    SalesChannel,
} from '@vfde-sails/constants';
import { createTrackingData } from '../App/helpers/tracking';
import { SelectorReturnType } from '@vfde-sails/core';
import { getQueryParam } from '@vfde-sails/utils';
import {
    selectDeviceId,
    selectSalesChannel,
} from '../App/selectors';
import { getNewSelectedCapacity } from './helpers/capacityHelper';
import { redirectToDop } from 'Helper/redirectToHelper';
import { getSubscriptionIdsFromCms } from 'Helper/tariffOptionPickerHelpers';
import {
    GladosServiceFactory,
    HardwareDetailGroupParams,
} from '@vfde-sails/glados-v2';
import {
    changeCapacity,
    changeColor,
    getDevice,
    getDeviceFailed,
    getDeviceSuccess,
    setAtomicId,
    setDefaultState,
} from './slice';
import { getSubscriptions } from '../Tariff/slice';
import { selectActiveOffer } from 'Container/Tariff/selectors';

/**
 * Options saga
 * Watches actions
 */
export default function* optionsSaga (): Generator<StrictEffect> {
    yield takeLatest(setDefaultState.type, initSaga);
    yield takeLatest(getDevice.type, getDeviceSaga);
    yield takeLatest(getDeviceSuccess.type, getDeviceSuccessSaga);
    yield takeLatest(changeColor.type, changeColorSaga);
    yield takeLatest(changeCapacity.type, changeCapacitySaga);
    yield takeLatest(setAtomicId.type, setAtomicIdSaga);
}

/**
 * Initialize color and capacity on first load
 */
export function* initSaga (): Generator<StrictEffect> {
    const [deviceId] = (yield all([
        select(selectDeviceId()),
    ])) as [
        SelectorReturnType<typeof selectDeviceId>,
    ];

    deviceId ? yield put(getDevice()) : yield call(redirectToDop);
}

/**
 * Get device from Glados
 */
export function* getDeviceSaga (): Generator<StrictEffect> {
    const hardwareService = GladosServiceFactory.getHardwareService();

    /* dev-only-code:start */
    hardwareService.setMocking(!!getQueryParam('useMockedApi'));
    /* dev-only-code:end */

    const [
        salesChannel,
        deviceId,
    ] = (yield all([
        select(selectSalesChannel()),
        select(selectDeviceId()),
    ])) as [
        NonNullable<SelectorReturnType<typeof selectSalesChannel>>,
        NonNullable<SelectorReturnType<typeof selectDeviceId>>,
    ];

    const subscriptionIds = getSubscriptionIdsFromCms(salesChannel);

    const params: HardwareDetailGroupParams = {
        btx: API_BTX_VVL,
        salesChannel: [MAP_SALESCHANNEL_TO_API_SALESCHANNEL[salesChannel as SalesChannel]],
        groupId: deviceId!,
        discountIds: [],
        tariffIds: subscriptionIds,
    };

    try {
        const response =
        (yield call([hardwareService, hardwareService.getHardwareDetailGroup], 'v1', params)) as
            Awaited<ReturnType<typeof hardwareService.getHardwareDetailGroup>>;
        const { data } = response;

        yield put(getDeviceSuccess(data));
    }
    catch (error: any) {
        // eslint-disable-next-line no-console
        yield call([console, 'error'], error);

        const { response } = error;

        if (response && response.status === 404) {
            yield call(redirectToDop);
        }
        else {
            yield put(getDeviceFailed());
        }
    }
}

/**
 * Get device success saga
 */
export function* getDeviceSuccessSaga (): Generator<StrictEffect> {
    const atomicId = (yield select(selectAtomicId())) as SelectorReturnType<typeof selectAtomicId>;
    yield put(setAtomicId(atomicId!));
    yield put(getSubscriptions());
}

/**
 * Change color
 */
export function* changeColorSaga (): Generator<StrictEffect> {
    const [currentCapacity, capacitiesForColor] = (yield all([
        select(selectCurrentCapacity()),
        select(selectCapacitiesForColor()),
    ])) as [
        SelectorReturnType<typeof selectCurrentCapacity>,
        SelectorReturnType<typeof selectCapacitiesForColor>,
    ];

    const newCapacity = getNewSelectedCapacity(capacitiesForColor!, currentCapacity!);

    yield put(changeCapacity(newCapacity.sortValue));
}

/**
 * Change capacity
 */
export function* changeCapacitySaga (): Generator<StrictEffect> {
    const [currentColor, currentCapacity, atomics] = (yield all([
        select(selectCurrentColor()),
        select(selectCurrentCapacity()),
        select(selectAtomicDevices()),
    ])) as [
        SelectorReturnType<typeof selectCurrentColor>,
        SelectorReturnType<typeof selectCurrentCapacity>,
        SelectorReturnType<typeof selectAtomicDevices>,
    ];

    const newAtomicDevice = atomics!
        .filter(atomic => {
            const { capacity, color } = atomic;

            return color.displayLabel === currentColor?.displayLabel && capacity.sortValue === currentCapacity?.sortValue;
        })[0];

    yield put(setAtomicId(newAtomicDevice.hardwareId));
}

/**
 * Update atomic ID in session storage
 */
export function* setAtomicIdSaga (action: ReturnType<typeof setAtomicId>): Generator<StrictEffect> {

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Intersect type isn't recognized here
    yield call(updateStorage<SailsVvlStorage>, SAILS_VVL_STORAGE, {
        [SAILS_PARAM_ATOMIC_ID]: action.payload.atomicId,
    }, getSessionStorageItemJson(SAILS_VVL_STORAGE), { shouldDeepMerge: true });

    const activeOffer = (yield select(selectActiveOffer())) as SelectorReturnType<typeof selectActiveOffer>;
    activeOffer && (yield call(createTrackingData));
}
