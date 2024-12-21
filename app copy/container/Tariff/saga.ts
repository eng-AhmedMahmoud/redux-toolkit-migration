import { getSubscriptionId } from 'Helper/getUserDataHelper';
import {
    all,
    call,
    put,
    select,
    StrictEffect,
    takeLatest,
} from 'redux-saga/effects';
import {
    selectDeviceId,
    selectGigakombiType,
    selectIsGigakombiEligible,
    selectSalesChannel,
    selectTrackingPayload,
    selectIsTradeIn,
    selectIsTauschbonus,
} from '../App/selectors';
import {
    getSessionStorageItemJson,
    SailsVvlStorage,
    updateStorage as updateStorageHelper,
} from '@vfde-sails/storage';
import {
    API_BTX_VVL,
    MAP_SALESCHANNEL_TO_API_SALESCHANNEL,
    RedTariff,
    SAILS_PARAM_SUB_ID,
    SAILS_VVL_STORAGE,
    SalesChannel,
    URL_PARAM_SUBGROUP_ID,
    YoungTariff,
} from '@vfde-sails/constants';
import {
    createPageViewTrackingData,
    createTrackingData,
} from '../App/helpers/tracking';
import {
    createUrlWithQueryString,
    getQueryParam,
    hasQueryParam,
    updateUrl,
} from '@vfde-sails/utils';
import { SelectorReturnType } from '@vfde-sails/core';
import {
    setSalesChannel,
    trackPageView,
} from '../App/slice';
import { selectAtomicDevices } from '../Options/selectors';
import {
    addTrackingToAction,
    TrackType,
} from '@vfde-sails/tracking';
import {
    checkSubscriptionIdExistsInSubscriptions,
    getSubscriptionIdsFromCms,
} from 'Helper/tariffOptionPickerHelpers';
import {
    selectActiveOffers,
    selectSubscriptionId,
} from './selectors';
import {
    GladosServiceFactory,
    TariffWithHardwareParams,
} from '@vfde-sails/glados-v2';
import {
    getAllDiscounts,
    GetAllDiscountsOptions,
} from '@vfde-sails/page-options';
import {
    getSubscriptions,
    getSubscriptionsFailed,
    getSubscriptionsSuccess,
    setDefaultState,
    setSubscriptionId,
} from './slice';

/**
 * Tariff saga
 * Watches actions
 */
export default function* tariffSaga (): Generator<StrictEffect> {
    yield takeLatest(setDefaultState.type, setSubscriptionIdSaga);
    yield takeLatest(setSalesChannel.type, setSubscriptionIdSaga);
    yield takeLatest(getSubscriptions.type, getSubscriptionsSaga);
    yield takeLatest(setSubscriptionId.type, setSubscriptionIdInStorageSaga);
}

/**
 * setSubscriptionIdSaga
 *
 */
export function* setSubscriptionIdSaga (): Generator<StrictEffect> {
    const salesChannel = (yield select(selectSalesChannel())) as SelectorReturnType<typeof selectSalesChannel>;

    if (salesChannel) {
        const subscriptionId = (yield call(getSubscriptionId, salesChannel)) as ReturnType<typeof getSubscriptionId>;
        yield put(setSubscriptionId(subscriptionId!, true, false));
    }
}

/**
 * setSubscriptionIdSaga
 * Save new subscription Id in storage and set the new active offer
 */
export function* setSubscriptionIdInStorageSaga (action: ReturnType<typeof setSubscriptionId>): Generator<StrictEffect> {
    const { subscriptionId, updateStorage, shouldTrackPageView } = action.payload;
    const salesChannel = (yield select(selectSalesChannel())) as SelectorReturnType<typeof selectSalesChannel>;

    // Update parameter when exists
    if (hasQueryParam(URL_PARAM_SUBGROUP_ID)) {
        yield call(updateUrl, createUrlWithQueryString(URL_PARAM_SUBGROUP_ID, subscriptionId), true);
    }

    if (updateStorage && salesChannel) {
        yield call(updateStorageHelper<SailsVvlStorage>, SAILS_VVL_STORAGE, {
            [SAILS_PARAM_SUB_ID]: {
                [salesChannel]: subscriptionId,
            },
        }, getSessionStorageItemJson(SAILS_VVL_STORAGE), { shouldDeepMerge: true });
    }

    if (shouldTrackPageView) {
        const trackingData = (yield select(selectTrackingPayload())) as SelectorReturnType<typeof selectTrackingPayload>;
        const trackingPayload = (yield call(createPageViewTrackingData, trackingData)) as ReturnType<typeof createPageViewTrackingData>;

        yield put(addTrackingToAction(
            trackPageView(),
            TrackType.PageView,
            trackingPayload!,
        ));
    }
}

/**
 * Get subscription from Glados
 */
export function* getSubscriptionsSaga (): Generator<StrictEffect> {
    const tariffService = GladosServiceFactory.getTariffService();

    /* dev-only-code:start */
    tariffService.setMocking(!!getQueryParam('useMockedApi'));
    /* dev-only-code:end */

    const [
        deviceId,
        salesChannel,
        atomicDevices,
        gigakombiType,
        isGigakombiEligible,
        subscriptionId,
        isTradeIn,
        isTauschbonus,
    ] = (yield all([
        select(selectDeviceId()),
        select(selectSalesChannel()),
        select(selectAtomicDevices()),
        select(selectGigakombiType()),
        select(selectIsGigakombiEligible()),
        select(selectSubscriptionId()),
        select(selectIsTradeIn()),
        select(selectIsTauschbonus()),
    ])) as [
            NonNullable<SelectorReturnType<typeof selectDeviceId>>,
            NonNullable<SelectorReturnType<typeof selectSalesChannel>>,
            NonNullable<SelectorReturnType<typeof selectAtomicDevices>>,
            NonNullable<SelectorReturnType<typeof selectGigakombiType>>,
            NonNullable<SelectorReturnType<typeof selectIsGigakombiEligible>>,
            NonNullable<SelectorReturnType<typeof selectSubscriptionId>>,
            NonNullable<SelectorReturnType<typeof selectIsTradeIn>>,
            NonNullable<SelectorReturnType<typeof selectIsTauschbonus>>,
        ];

    const subscriptionIds = (yield call(getSubscriptionIdsFromCms, salesChannel as SalesChannel)) as ReturnType<typeof getSubscriptionIdsFromCms>;

    const allDiscountsOptions: GetAllDiscountsOptions = {
        salesChannel,
        deviceId,
        subscriptionIds,
        isGigakombi: isGigakombiEligible && !!gigakombiType,
        gigakombiType,
        isTradeIn,
        isTauschbonus,
        isRestlaufzeit: false,
    };

    // @todo check the discount logic especially with GigaKombi (Logic was at getRequestBody func)
    const params: TariffWithHardwareParams = {
        btx: API_BTX_VVL,
        salesChannel: [MAP_SALESCHANNEL_TO_API_SALESCHANNEL[salesChannel as SalesChannel]],
        discountIds: getAllDiscounts(allDiscountsOptions),
        tariffIds: subscriptionIds,
        atomicIds: atomicDevices?.map(atomic => atomic.hardwareId) || [],
    };

    try {
        const response =
            (yield call([tariffService, tariffService.getTariffWithHardware], 'v1', params)) as
                Awaited<ReturnType<typeof tariffService.getTariffWithHardware<RedTariff | YoungTariff>>>;
        const { data } = response;

        yield put(getSubscriptionsSuccess(data));
        yield call(createTrackingData);

        const offers = (yield select(selectActiveOffers())) as
            NonNullable<SelectorReturnType<typeof selectActiveOffers>>;

        if (!checkSubscriptionIdExistsInSubscriptions(subscriptionId, offers)) {

            yield put(setSubscriptionId(offers[offers.length - 1].virtualItemId as RedTariff | YoungTariff));
        }
    }
    catch (error) {
        // eslint-disable-next-line no-console
        yield call([console, 'error'], error);

        if (error instanceof Error) {
            yield put(getSubscriptionsFailed());
        }
    }
}
