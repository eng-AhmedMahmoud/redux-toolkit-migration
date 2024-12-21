import { RootState } from '@vfde-sails/core';
import {
    createSelector,
    Selector,
} from 'reselect';
import { IInitialState as IInitialStateTariff } from './interface';
import { IInitialState as IInitialStateApp } from '../App/interfaces/state';
import { IInitialState as IInitialStateOptions } from '../Options/interface';

import { roundToTwoDecimal } from '@vfde-sails/utils';
import { selectSalesChannel } from '../App/selectors';
import { selectAtomicId } from '../Options/selectors';
import {
    DataVolume,
    getDataVolumeWithOrWithoutDiscounts,
    getFromArrayWithRunTimeEnd,
    getFromArrayWithRunTimeStart,
    getMonthlyPriceWithOrWithoutDiscounts,
    OfferType,
    PriceType,
    PriceWithRuntime,
    TariffWithHardwareOffer,
} from '@vfde-sails/glados-v2';
import tariffSlice from './slice';

const selectState = (state: RootState<IInitialStateTariff>): IInitialStateTariff => state[tariffSlice.name] || tariffSlice.getInitialState();

const selectTariffsLoadingFlag = (): Selector<RootState<IInitialStateTariff>, boolean> =>
    createSelector(
        selectState,
        state => Object.values(state.loading).some(isLoading => isLoading),
    );

const selectTariffsErrorsFlag = (): Selector<RootState<IInitialStateTariff>, boolean> =>
    createSelector(
        selectState,
        state => Object.values(state.errors).some(hasError => hasError),
    );

const selectSubscriptionId = (): Selector<RootState<IInitialStateTariff>, IInitialStateTariff['subscriptionId']> =>
    createSelector(
        selectState,
        state => state.subscriptionId,
    );

const selectPromotionalSummaryCardOffer = (): Selector<RootState<IInitialStateTariff>, IInitialStateTariff['promotionalSummaryCardOffer']> =>
    createSelector(
        selectState,
        state => state.promotionalSummaryCardOffer,
    );

const selectSubscriptionPayload = (): Selector<RootState<IInitialStateTariff>, IInitialStateTariff['subscriptionPayload']> =>
    createSelector(selectState, state => state.subscriptionPayload);

const selectActiveOffers = (): Selector<RootState<IInitialStateTariff & IInitialStateOptions>, TariffWithHardwareOffer[] | null> =>
    createSelector(selectSubscriptionId(), selectAtomicId(), selectSubscriptionPayload(),
        (subscriptionId, atomicId, subscriptionPayload) => {

            if (!subscriptionId || !atomicId || !subscriptionPayload) {
                return null;
            }

            let activeSubscriptions = subscriptionPayload?.data?.find(tariff => tariff.hardware.hardwareId === atomicId)?.tariffs || null;

            if (activeSubscriptions) {
                activeSubscriptions = [...activeSubscriptions].sort((a, b) => Number(a.virtualItemId) - Number(b.virtualItemId));
            }

            return activeSubscriptions;
        });

const selectActiveOffer = (): Selector<RootState<IInitialStateTariff & IInitialStateOptions>, TariffWithHardwareOffer | null> =>
    createSelector(selectSubscriptionId(), selectActiveOffers(),
        (subscriptionId, activeSubscriptions) => activeSubscriptions?.find(tariff => tariff.virtualItemId === subscriptionId) || (activeSubscriptions && activeSubscriptions[activeSubscriptions.length - 1]) || null);

const selectTariffPrice = (): Selector<RootState<IInitialStateTariff & IInitialStateOptions>, PriceWithRuntime | null> =>
    createSelector(
        selectActiveOffer(),
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

const selectTariffPriceWithoutDiscounts = (): Selector<RootState<IInitialStateTariff & IInitialStateOptions>, PriceWithRuntime | null> =>
    createSelector(
        selectActiveOffer(),
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

const selectEndTariffPrice = (): Selector<RootState<IInitialStateTariff & IInitialStateOptions>, PriceWithRuntime | null> =>
    createSelector(
        selectActiveOffer(),
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

const selectDataVolume = (): Selector<RootState<IInitialStateTariff & IInitialStateOptions>, DataVolume | null> =>
    createSelector(
        selectActiveOffer(),
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

const selectEndDataVolume = (): Selector<RootState<IInitialStateTariff & IInitialStateOptions>, DataVolume | null> =>
    createSelector(
        selectActiveOffer(),
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

const selectStairway = (): Selector<RootState<IInitialStateTariff & IInitialStateOptions>, boolean> =>
    createSelector(
        selectTariffPrice(), selectEndTariffPrice(),
        (tariffPrice, endTariffPrice) => !!tariffPrice && !!endTariffPrice && tariffPrice !== endTariffPrice,
    );

const selectStrikePrice = (): Selector<RootState<IInitialStateTariff & IInitialStateApp & IInitialStateOptions>, PriceWithRuntime | null> =>
    createSelector(
        selectSalesChannel(),
        selectActiveOffer(),
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

const selectPriceToPay = (): Selector<RootState<IInitialStateTariff & IInitialStateOptions>, PriceWithRuntime | null> =>
    createSelector(
        selectTariffPrice(),
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

const selectEndPriceToPay = (): Selector<RootState<IInitialStateTariff & IInitialStateOptions>, PriceWithRuntime | null> =>
    createSelector(
        selectEndTariffPrice(),
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
    selectTariffsLoadingFlag,
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
};
