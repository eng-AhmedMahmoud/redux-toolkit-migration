import { createAppSelector } from '../../app/createAppSelector';
import {
    selectActiveOffer,
    selectPriceToPay,
    selectSubscriptionId,
    selectTariffsErrorsFlag,
    selectTariffsLoadingFlag,
} from '../Tariff/selectors';
import {
    selectAtomicDevice,
    selectOptionsErrorsFlag,
    selectOptionsLoadingFlag,
} from '../Options/selectors';
import { RootState } from '../../app/store';
import appSlice from './slice';

const selectAppState = (state: RootState) => state[appSlice.reducerPath] || appSlice.getInitialState();

const selectIsLoading = createAppSelector([
    selectAppState,
    selectOptionsLoadingFlag,
    selectTariffsLoadingFlag,
], (state, optionsLoading, tariffLoading) => state.loading.startVvlAuth || optionsLoading || tariffLoading);

const selectSalesChannel = createAppSelector([
    selectAppState,
], state => state.salesChannel,
);

const selectDeviceId = createAppSelector([
    selectAppState,
], state => state.deviceId,
);

const selectIsSimonlyEligible = createAppSelector([
    selectAppState,
], state => state.isSimonlyEligible,
);

const selectIsYoungEligible = createAppSelector([
    selectAppState,
], state => state.isYoungEligible,
);

const selectIsRedplusEligible = createAppSelector([
    selectAppState,
], state => state.isRedplusEligible,
);

const selectIsTradeIn = createAppSelector([
    selectAppState,
], state => state.isTradeIn,
);

const selectIsTauschbonus = createAppSelector([
    selectAppState,
], state => state.isTauschbonus,
);

const selectIsTauschbonusEligible = createAppSelector([
    selectAppState,
], state => state.isTauschbonusEligible,
);

const selectIsGigakombiEligible = createAppSelector([
    selectAppState,
], state => state.isGigakombiEligible,
);

const selectGigakombiType = createAppSelector([
    selectAppState,
], state => state.gigakombiType,
);
const selectHasError = createAppSelector([
    selectOptionsErrorsFlag,
    selectTariffsErrorsFlag,
], (optionsErrorsFlag, tariffsErrorsFlag) => optionsErrorsFlag || tariffsErrorsFlag);

const selectTrackingPayload = createAppSelector([
    selectSalesChannel,
    selectSubscriptionId,
    selectActiveOffer,
    selectAtomicDevice,
    selectPriceToPay,
],
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
    selectHasError,
};
