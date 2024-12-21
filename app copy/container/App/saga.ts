import {
    VVL_AUTH_DONE,
    VVL_REDPLUS_ELIGIBILITY_DONE,
} from '@vfde-sails/vvl';
import {
    getDeviceId,
    getIsRedplusEligible,
    getIsSimonlyEligible,
    getIsYoungEligible,
    getSalesChannel,
    getGigakombiType,
    getIsGigakombiEligible,
} from '../../helpers/getUserDataHelper';
import {
    all,
    call,
    put,
    StrictEffect,
    takeLatest,
} from 'redux-saga/effects';
import {
    createUrlWithQueryString,
    hasQueryParam,
    updateUrl,
} from '@vfde-sails/utils';
import { SelectorReturnType } from '@vfde-sails/core';
import { redirectToDop } from 'Helper/redirectToHelper';
import {
    getSessionStorageItemJson,
    SailsVvlStorage,
    updateStorage,
} from '@vfde-sails/storage';
import {
    SAILS_PARAM_DEVICE_ID,
    SAILS_PARAM_SALESCHANNEL,
    SAILS_PARAM_TRADE_IN,
    SAILS_VVL_STORAGE,
    URL_PARAM_SUBGROUP_ID,
} from '@vfde-sails/constants';
import mountOptionsContainer from '../Options';
import { generateDeeplinkHelper } from 'Helper/generateDeeplinkHelper';
import {
    setDefaultState,
    setSalesChannel,
    setIsRedplusEligible,
    goToBasket,
    goToFamilyCard,
} from './slice';
import { getDevice } from '../Options/slice';
import { getIsTradeIn } from 'Helper/getTradeInHelpers';
import { getIsTauschbonusEligible } from 'Helper/getTauschbonusHelpers';

/**
 * hardwareDetail saga
 * Watches actions
 */
export default function* vvlHardwareDetailSaga (): Generator<StrictEffect> {
    yield takeLatest(VVL_AUTH_DONE, authDoneSaga);
    yield takeLatest(setSalesChannel.type, setSalesChannelSaga);
    yield takeLatest(VVL_REDPLUS_ELIGIBILITY_DONE, setIsRedplusEligibleSaga);
    yield takeLatest(goToBasket.type, goToBasketSaga);
    yield takeLatest(goToFamilyCard.type, goToFamilyCardSaga);
}

/**
 * authDoneSaga
 * After authentication, we set default state.
 * If device Id exist, call get device action. If not, redirect to DOP
 */
export function* authDoneSaga (): Generator<StrictEffect> {
    const [
        salesChannel,
        deviceId,
        isSimonlyEligible,
        isYoungEligible,
        isGigakombiEligible,
        gigakombiType,
        isTradeIn,
    ] = (yield all([
        call(getSalesChannel),
        call(getDeviceId),
        call(getIsSimonlyEligible),
        call(getIsYoungEligible),
        call(getIsGigakombiEligible),
        call(getGigakombiType),
        call(getIsTradeIn),
    ])) as [
        SelectorReturnType<typeof getSalesChannel>,
        SelectorReturnType<typeof getDeviceId>,
        SelectorReturnType<typeof getIsSimonlyEligible>,
        SelectorReturnType<typeof getIsYoungEligible>,
        SelectorReturnType<typeof getIsGigakombiEligible>,
        SelectorReturnType<typeof getGigakombiType>,
        SelectorReturnType<typeof getIsTradeIn>,
    ];

    const isTauschbonusEligible = getIsTauschbonusEligible(deviceId!);

    yield put(
        setDefaultState(
            salesChannel!,
            deviceId!,
            isSimonlyEligible,
            isYoungEligible,
            isGigakombiEligible,
            gigakombiType,
            isTradeIn,
            isTradeIn && isTauschbonusEligible,
            isTauschbonusEligible,
        ),
    );
    yield call(updateStorage<SailsVvlStorage>, SAILS_VVL_STORAGE, {
        [SAILS_PARAM_SALESCHANNEL]: salesChannel!,
        [SAILS_PARAM_DEVICE_ID]: deviceId!,
        [SAILS_PARAM_TRADE_IN]: isTradeIn,
    }, getSessionStorageItemJson(SAILS_VVL_STORAGE), { shouldDeepMerge: true });

    deviceId ? yield call(mountOptionsContainer) : yield call(redirectToDop);
}

/**
 * setSalesChannelSaga
 * Save new sales channel in storage and call getDevice action to fetch API data.
 */
export function* setSalesChannelSaga (action: ReturnType<typeof setSalesChannel>): Generator<StrictEffect> {
    const salesChannel = action.payload;

    // Delete tariffId parameter when exists
    if (hasQueryParam(URL_PARAM_SUBGROUP_ID)) {
        yield call(updateUrl, createUrlWithQueryString(URL_PARAM_SUBGROUP_ID, ''), true);
    }

    yield call(updateStorage<SailsVvlStorage>, SAILS_VVL_STORAGE, {
        [SAILS_PARAM_SALESCHANNEL]: salesChannel,
    }, getSessionStorageItemJson(SAILS_VVL_STORAGE), { shouldDeepMerge: true });

    yield put(getDevice());
}

/**
 * setIsRedplusEligibleSaga
 * Set the value of isRedplusEligible
 */
export function* setIsRedplusEligibleSaga (): Generator<StrictEffect> {
    yield put(setIsRedplusEligible(getIsRedplusEligible()));
}

/**
 * Go to basket saga
 */
export function* goToBasketSaga (): Generator<StrictEffect> {
    const basketDeeplink = (yield call(generateDeeplinkHelper)) as string;

    yield call([window.location, 'assign'], basketDeeplink);
}

/**
 * Go to family card saga
 */
export function* goToFamilyCardSaga (): Generator<StrictEffect> {
    const { offerSummaryCard } = (window as any).additionalPageOptions;
    const familyCardLink = offerSummaryCard?.familyCardLink;
    yield call([window.location, 'assign'], familyCardLink);
}
