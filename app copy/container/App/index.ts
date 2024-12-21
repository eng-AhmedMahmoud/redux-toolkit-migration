import {
    connect,
    injectReducer,
    injectSaga,
    RootState,
} from '@vfde-sails/core';
import './style.scss';
import { createStructuredSelector } from 'reselect';
import vvlHardwareDetailSaga from './saga';
import {
    IInitialState as IInitialStateApp,
    StateProps,
} from './interfaces/state';
import {
    selectHasError,
    selectIsLoading,
    selectIsRedplusEligible,
    selectIsYoungEligible,
    selectSalesChannel,
} from './selectors';
import {
    authenticationSaga,
    NAMESPACE_AUTH,
} from '@vfde-sails/vvl';
import {
    mountPortfolioSwitch,
    handleSalesChannelOptionPickerSelection,
} from '../../components/Switch';
import {
    ERROR_NOTIFICATION_CONTAINER_ID,
    HTML_CONTAINER_ID_PREFIX,
    PORTFOLIO_SWITCH_CONTAINER_ID,
    PORTFOLIO_SWITCH_OPTION_PICKER_ID,
} from './constants';
import { mountLoadingSpinner } from '../../components/LoadingSpinner';
import {
    LOADING_INDICATOR_CSS_SELECTOR,
    type SalesChannel,
    type SALESCHANNEL_CONSUMER,
    type SALESCHANNEL_YOUNG,
} from '@vfde-sails/constants';
import {
    toggleElementById,
    toggleTariffOptionPickers,
} from 'Helper/domHelper';
import { selectSubscriptionId } from '../Tariff/selectors';
import { IInitialState as IInitialStateTariff } from '../Tariff/interface';
import { IInitialState as IInitialStateOptions } from '../Options/interface';
import mountBeltContainer from '../../components/beltContainer';
import appSlice, {
    appActionDispatchers,
    AppActionDispatchers,
} from './slice';
import optionsSlice from '../Options/slice';
import tariffSlice from '../Tariff/slice';
import mountTradeInContainer from '../TradeIn';
import { mountEditorialAccordions } from '../../components/Accordion';
import { TECHNICAL_DETAILS_ACCORDION_CONTAINER_ID } from '../Options/constants';
import tradeInSlice from '../TradeIn/slice';

function VvlHardwareDetail (state: StateProps, actions: AppActionDispatchers) {
    injectReducer(appSlice.name, appSlice.reducer);
    injectReducer(optionsSlice.name, optionsSlice.reducer);
    injectReducer(optionsSlice.name, tariffSlice.reducer);
    injectReducer(tradeInSlice.name, tradeInSlice.reducer);

    injectSaga(appSlice.name, vvlHardwareDetailSaga);

    // VVL shared sagas for NBA calls
    injectSaga(NAMESPACE_AUTH, authenticationSaga);
    actions.startVVLAuthentication();

    // Mount re-usable components
    const integrationLayerBeltContainer = mountBeltContainer(HTML_CONTAINER_ID_PREFIX)!;
    const errorNotificationBeltContainer = mountBeltContainer(ERROR_NOTIFICATION_CONTAINER_ID);
    const loadingSpinner = mountLoadingSpinner(LOADING_INDICATOR_CSS_SELECTOR);
    const portfolioSwitch = mountPortfolioSwitch(PORTFOLIO_SWITCH_OPTION_PICKER_ID, actions.setSalesChannel);
    // Mount all editorial accordions at once, except technical details one, because that is mounted and used by code)
    mountEditorialAccordions([TECHNICAL_DETAILS_ACCORDION_CONTAINER_ID], actions.toggleAccordion);

    // Initialize trade in container
    mountTradeInContainer();

    return {
        getDerivedStateFromProps (newState: StateProps, oldState: StateProps) {

            if (errorNotificationBeltContainer && newState.hasError && !oldState.hasError) {
                errorNotificationBeltContainer.toggleContainer(false);
                integrationLayerBeltContainer.toggleContainer(true);
                loadingSpinner && loadingSpinner.toggle(false);
            }
            else if (oldState.isLoading || newState.isLoading) {
                loadingSpinner && loadingSpinner.toggle(newState.isLoading);
            }

            if (newState.isYoungEligible) {
                toggleElementById(PORTFOLIO_SWITCH_CONTAINER_ID, false);
            }

            if (newState.salesChannel !== oldState.salesChannel && newState.salesChannel) {
                handleSalesChannelOptionPickerSelection(
                    portfolioSwitch,
                    newState.salesChannel as Extract <SalesChannel, typeof SALESCHANNEL_CONSUMER | typeof SALESCHANNEL_YOUNG>,
                );
                toggleTariffOptionPickers(newState.salesChannel);
            }
        },
    };
}

const mapStateToProps = createStructuredSelector<RootState<IInitialStateApp & IInitialStateTariff & IInitialStateOptions>, StateProps>({
    isLoading: selectIsLoading(),
    hasError: selectHasError(),
    salesChannel: selectSalesChannel(),
    isYoungEligible: selectIsYoungEligible(),
    isRedplusEligible: selectIsRedplusEligible(),
    subscriptionId: selectSubscriptionId(),
});

const mountVvlHardwareDetailContainer = connect(mapStateToProps, appActionDispatchers)(VvlHardwareDetail);

export default mountVvlHardwareDetailContainer;
