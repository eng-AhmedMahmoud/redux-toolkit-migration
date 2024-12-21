import {
    RootState,
    SelectorReturnType,
    createDeepEqualSelectorInput,
} from '@vfde-sails/core';
import {
    createSelector,
    Selector,
} from 'reselect';
import { IInitialState } from './interfaces/state';
import appSlice from './slice';
import {
    selectAtomicDevice,
    selectOptionsErrorsFlag,
    selectOptionsLoadingFlag,
} from '../Options/selectors';
import {
    selectActiveOffer,
    selectPriceToPay,
    selectSubscriptionId,
    selectTariffsErrorsFlag,
    selectTariffsLoadingFlag,
} from '../Tariff/selectors';
import { IInitialState as IInitialStateTariff } from '../Tariff/interface';
import { IInitialState as IInitialStateOptions } from '../Options/interface';

const selectState = (state: RootState<IInitialState>): IInitialState => state[appSlice.name] || appSlice.getInitialState();

const selectIsLoading = (): Selector<RootState<IInitialState & IInitialStateOptions & IInitialStateTariff>, boolean> =>
    createSelector(
        selectState,
        selectOptionsLoadingFlag(),
        selectTariffsLoadingFlag(),

        (state, optionsLoadingFlag, tariffsLoadingFlag) => Object.values(state.loading).some(isLoading => isLoading) || optionsLoadingFlag || tariffsLoadingFlag,
    );

const selectHasError = (): Selector<RootState<IInitialStateOptions & IInitialStateTariff>, boolean> =>
    createSelector(
        selectOptionsErrorsFlag(),
        selectTariffsErrorsFlag(),

        (optionsErrorsFlag, tariffsErrorsFlag) => optionsErrorsFlag || tariffsErrorsFlag,
    );

const selectSalesChannel = (): Selector<RootState<IInitialState>, IInitialState['salesChannel']> =>
    createSelector(
        selectState,
        state => state.salesChannel,
    );

const selectDeviceId = (): Selector<RootState<IInitialState>, IInitialState['deviceId']> =>
    createSelector(
        selectState,
        state => state.deviceId,
    );

const selectIsSimonlyEligible = (): Selector<RootState<IInitialState>, IInitialState['isSimonlyEligible']> =>
    createSelector(
        selectState,
        state => state.isSimonlyEligible,
    );

const selectIsYoungEligible = (): Selector<RootState<IInitialState>, IInitialState['isYoungEligible']> =>
    createSelector(
        selectState,
        state => state.isYoungEligible,
    );

const selectIsRedplusEligible = (): Selector<RootState<IInitialState>, IInitialState['isRedplusEligible']> =>
    createSelector(
        selectState,
        state => state.isRedplusEligible,
    );

const selectIsTradeIn = (): Selector<RootState<IInitialState>, IInitialState['isTradeIn']> =>
    createSelector(
        selectState,
        state => state.isTradeIn,
    );

const selectIsTauschbonus = (): Selector<RootState<IInitialState>, IInitialState['isTauschbonus']> =>
    createSelector(
        selectState,
        state => state.isTauschbonus,
    );

const selectIsTauschbonusEligible = (): Selector<RootState<IInitialState>, IInitialState['isTauschbonusEligible']> =>
    createSelector(
        selectState,
        state => state.isTauschbonusEligible,
    );

const selectIsGigakombiEligible = (): Selector<RootState<IInitialState>, IInitialState['isGigakombiEligible']> =>
    createSelector(
        selectState,
        state => state.isGigakombiEligible,
    );

const selectGigakombiType = (): Selector<RootState<IInitialState>, IInitialState['gigakombiType']> =>
    createSelector(
        selectState,
        state => state.gigakombiType,
    );

const selectTrackingPayload = (): Selector<RootState<IInitialState & IInitialStateOptions & IInitialStateTariff>, {
    salesChannel: SelectorReturnType<typeof selectSalesChannel>,
    subscriptionId: SelectorReturnType<typeof selectSubscriptionId>,
    activeOffer: SelectorReturnType<typeof selectActiveOffer>,
    atomicDevice: SelectorReturnType<typeof selectAtomicDevice>,
    priceToPay: SelectorReturnType<typeof selectPriceToPay>,
}> =>
    createDeepEqualSelectorInput(
        selectSalesChannel(),
        selectSubscriptionId(),
        selectActiveOffer(),
        selectAtomicDevice(),
        selectPriceToPay(),
        (salesChannel, subscriptionId, activeOffer, atomicDevice, priceToPay) => (
            {
                salesChannel,
                subscriptionId,
                activeOffer,
                atomicDevice,
                priceToPay,
            }),
    );

export {
    selectIsLoading,
    selectHasError,
    selectSalesChannel,
    selectDeviceId,
    selectIsSimonlyEligible,
    selectIsYoungEligible,
    selectIsRedplusEligible,
    selectIsGigakombiEligible,
    selectGigakombiType,
    selectIsTradeIn,
    selectIsTauschbonus,
    selectIsTauschbonusEligible,
    selectTrackingPayload,
};
