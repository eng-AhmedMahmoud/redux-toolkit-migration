import {
    BTX_VVL,
    GigakombiType,
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
} from '../features/App/selectors';
import { selectAtomicId } from '../features/Options/selectors';
import { selectActiveOffer } from '../features/Tariff/selectors';
import { RootState } from '../app/store';
import { getSubscriptionIdsFromCms } from './tariffOptionPickerHelpers';
import {
    GetAllDiscountsOptions,
    getAllDiscounts,
} from '@vfde-sails/page-options';

/**
 * Generate deeplink
 */
export function generateDeeplinkHelper (state: RootState) {
    const salesChannel = selectSalesChannel(state) as SalesChannel;
    const deviceId = selectDeviceId(state);
    const gigakombiType = selectGigakombiType(state) as GigakombiType;
    const isGigakombiEligible = selectIsGigakombiEligible(state);
    const isTradeIn = selectIsTradeIn(state);
    const isTauschbonus = selectIsTauschbonus(state);
    const atomicDeviceId = selectAtomicId(state);
    const offer = selectActiveOffer(state);

    const subscriptionIds = getSubscriptionIdsFromCms(salesChannel as SalesChannel);

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
    const discountIds = getAllDiscounts(allDiscountsOptions);
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
