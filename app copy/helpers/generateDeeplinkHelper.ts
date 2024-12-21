import {
    BTX_VVL,
    SalesChannel,
} from '@vfde-sails/constants';
import {
    BASKET_PROPOSITION_VVL,
    createBasket,
    createBasketItem,
    createBasketProposition,
    generateDeeplink,
} from '@vfde-sails/utils';
import {
    selectDeviceId,
    selectGigakombiType,
    selectIsGigakombiEligible,
    selectIsTauschbonus,
    selectIsTradeIn,
    selectSalesChannel,
} from '../container/App/selectors';
import { selectAtomicId } from '../container/Options/selectors';
import { selectActiveOffer } from '../container/Tariff/selectors';
import {
    all,
    call,
    select,
    StrictEffect,
} from 'redux-saga/effects';
import { SelectorReturnType } from '@vfde-sails/core';
import {
    getAllDiscounts,
    GetAllDiscountsOptions,
} from '@vfde-sails/page-options';
import { getSubscriptionIdsFromCms } from './tariffOptionPickerHelpers';

/**
 * Generate deeplink
 */
export function* generateDeeplinkHelper (): Generator<StrictEffect> {
    const [
        salesChannel,
        atomicDeviceId,
        offer,
        deviceId,
        gigakombiType,
        isGigakombiEligible,
        isTradeIn,
        isTauschbonus,
    ] = (yield all([
        select(selectSalesChannel()),
        select(selectAtomicId()),
        select(selectActiveOffer()),
        select(selectDeviceId()),
        select(selectGigakombiType()),
        select(selectIsGigakombiEligible()),
        select(selectIsTradeIn()),
        select(selectIsTauschbonus()),
    ])) as [
            NonNullable<SelectorReturnType<typeof selectSalesChannel>>,
            NonNullable<SelectorReturnType<typeof selectAtomicId>>,
            NonNullable<SelectorReturnType<typeof selectActiveOffer>>,
            NonNullable<SelectorReturnType<typeof selectDeviceId>>,
            NonNullable<SelectorReturnType<typeof selectGigakombiType>>,
            NonNullable<SelectorReturnType<typeof selectIsGigakombiEligible>>,
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

    const discountIds = (yield call(getAllDiscounts, allDiscountsOptions)) as string[];

    const basketItem = createBasketItem({
        sublevelTariffId: offer?.tariffId,
        atomicDeviceId: atomicDeviceId!,
        discountIds,
        btx: BTX_VVL,
    },
    );

    const proposition = createBasketProposition(BASKET_PROPOSITION_VVL, [basketItem]);

    const basket = createBasket(salesChannel!, [proposition]);

    return generateDeeplink(basket, true);
}
