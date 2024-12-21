import type { RootState } from '../../app/store';
import { roundToTwoDecimal } from '@vfde-sails/utils';
import {
    getDataVolumeWithOrWithoutDiscounts,
    getFromArrayWithRunTimeEnd,
    getFromArrayWithRunTimeStart,
    getMonthlyPriceWithOrWithoutDiscounts,
    OfferType,
    PriceType,
} from '@vfde-sails/glados-v2';
import tariffSlice from './slice';
import { createAppSelector } from '../../app/createAppSelector';
import { selectAtomicId } from '../Options/selectors';
import { getTariffWithHardware } from '../../api/glados';

const selectState = (state: RootState) => state[tariffSlice.reducerPath] || tariffSlice.getInitialState();

const selectSubscriptionId = createAppSelector(
    selectState,
    state => state.subscriptionId,
);

const selectPromotionalSummaryCardOffer = createAppSelector(
    selectState,
    state => state.promotionalSummaryCardOffer,
);

const createTariffWithHardwareSelector = createAppSelector(
    [
        state => state.vvlDeviceDetailsApp.salesChannel,
        state => state.vvlDeviceDetailsApp.isTradeIn,
    ],
    (salesChannel, isTradeIn) => getTariffWithHardware.select({
        salesChannel: salesChannel!,
        isTradeIn,
    }),
);

const selectTariffWithHardwareQuery = createAppSelector(
    [
        state => state,
        createTariffWithHardwareSelector,
    ],
    (state, selector) => selector(state),
);

const selectTariffsErrorsFlag = createAppSelector(
    [
        selectTariffWithHardwareQuery,
    ],
    state => state.isError,
);

const selectTariffsLoadingFlag = createAppSelector(
    [
        selectTariffWithHardwareQuery,
    ],
    state => state.isLoading,
);

const selectSubscriptionPayload = createAppSelector(
    [
        selectTariffWithHardwareQuery,
    ], state => state.data,
);

const selectActiveOffers = createAppSelector(
    [
        selectSubscriptionId,
        selectAtomicId,
        selectSubscriptionPayload,
    ],
    (subscriptionId, atomicId, subscriptionPayload) => {
        if (!subscriptionId || !atomicId || !subscriptionPayload) {
            return null;
        }

        let activeSubscriptions = subscriptionPayload?.data.find(tariff => tariff.hardware.hardwareId === atomicId)?.tariffs || null;

        if (activeSubscriptions) {
            activeSubscriptions = [...activeSubscriptions].sort((a, b) => Number(a.virtualItemId) - Number(b.virtualItemId));
        }

        return activeSubscriptions;
    });

const selectActiveOffer = createAppSelector([selectSubscriptionId, selectActiveOffers],
    (subscriptionId, activeSubscriptions) => activeSubscriptions?.find(tariff => tariff.virtualItemId === subscriptionId) || (activeSubscriptions && activeSubscriptions[activeSubscriptions.length - 1]) || null);

const selectTariffPrice = createAppSelector(
    [
        selectActiveOffer,
    ],
    tariff => {
        if (!tariff) {
            return null;
        }

        const {
            [PriceType.Monthly]: monthlyPrice,
        } = tariff.prices[OfferType.Composition][OfferType.SimOnly];

        const monthlyTariffPriceRespectingDiscounts = getMonthlyPriceWithOrWithoutDiscounts(
            monthlyPrice.withoutDiscounts,
            monthlyPrice.withDiscounts,
            getFromArrayWithRunTimeStart,
        );

        return monthlyTariffPriceRespectingDiscounts;
    },
);

const selectTariffPriceWithoutDiscounts = createAppSelector(
    [
        selectActiveOffer,
    ],
    tariff => {
        if (!tariff) {
            return null;
        }

        const {
            [PriceType.Monthly]: monthlyPrice,
        } = tariff.prices[OfferType.Composition][OfferType.SimOnly];

        return monthlyPrice.withoutDiscounts || null;
    },
);

const selectEndTariffPrice = createAppSelector(
    [
        selectActiveOffer,
    ],
    tariff => {
        if (!tariff) {
            return null;
        }

        const {
            [PriceType.Monthly]: monthlyPrice,
        } = tariff.prices[OfferType.Composition][OfferType.SimOnly];

        const monthlyTariffPriceRespectingDiscounts = getMonthlyPriceWithOrWithoutDiscounts(
            monthlyPrice.withoutDiscounts,
            monthlyPrice.withDiscounts,
            getFromArrayWithRunTimeEnd,
        );

        return monthlyTariffPriceRespectingDiscounts;
    },
);

const selectDataVolume = createAppSelector(
    [
        selectActiveOffer,
    ],
    tariff => {
        if (!tariff) {
            return null;
        }

        const dataVolume = getDataVolumeWithOrWithoutDiscounts(
            tariff.dataVolume.withoutDiscounts,
            tariff.dataVolume.withDiscounts,
            getFromArrayWithRunTimeStart,
        );

        return dataVolume;
    },
);

const selectEndDataVolume = createAppSelector(
    [
        selectActiveOffer,
    ],
    tariff => {
        if (!tariff) {
            return null;
        }

        const dataVolume = getDataVolumeWithOrWithoutDiscounts(
            tariff.dataVolume.withoutDiscounts,
            tariff.dataVolume.withDiscounts,
            getFromArrayWithRunTimeEnd,
        );

        return dataVolume;
    },
);

const selectStairway = createAppSelector(
    [
        selectTariffPrice,
        selectEndTariffPrice,
    ],
    (tariffPrice, endTariffPrice) => !!tariffPrice && !!endTariffPrice && tariffPrice !== endTariffPrice,
);

const selectStrikePrice = createAppSelector(
    [
        state => state.vvlDeviceDetailsApp.salesChannel,
        selectActiveOffer,
    ],
    (salesChannel, activeOffer) => {
        if (!salesChannel || !activeOffer) {
            return null;
        }

        const {
            [PriceType.Monthly]: monthlyPrice,
        } = activeOffer.prices[OfferType.Composition][OfferType.SimOnly];

        if (!monthlyPrice.withDiscounts?.length) {
            // When there are no discounted prices, we won't need a strike price
            return null;
        }

        if (
            getFromArrayWithRunTimeStart(monthlyPrice.withDiscounts).gross
                === monthlyPrice.withoutDiscounts.gross
        ) {
            // If the "discounted" price is the same as the not discounted price, we won't need a strike price
            return null;
        }

        return monthlyPrice.withoutDiscounts;
    },
);

const selectPriceToPay = createAppSelector(
    [
        selectTariffPrice,
    ],
    tariffPrice => {
        if (!tariffPrice) {
            return null;
        }

        return {
            ...tariffPrice,
            gross: roundToTwoDecimal(tariffPrice.gross),
        };
    },
);

const selectEndPriceToPay = createAppSelector(
    [
        selectEndTariffPrice,
    ],
    tariffPrice => {
        if (!tariffPrice) {
            return null;
        }

        return {
            ...tariffPrice,
            gross: roundToTwoDecimal(tariffPrice.gross),
        };
    },
);

export {
    selectTariffsErrorsFlag,
    selectSubscriptionPayload,
    selectTariffPrice,
    selectTariffPriceWithoutDiscounts,
    selectEndTariffPrice,
    selectDataVolume,
    selectEndDataVolume,
    selectStairway,
    selectStrikePrice,
    selectPriceToPay,
    selectEndPriceToPay,
    selectSubscriptionId,
    selectActiveOffer,
    selectActiveOffers,
    selectPromotionalSummaryCardOffer,
    selectTariffsLoadingFlag,
};
