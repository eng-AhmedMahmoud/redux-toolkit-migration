import { startAuthentication } from '@vfde-sails/vvl';
import { useAppDispatch } from '../../app/store';
import { startListeners } from './listeners';
import { startListeners as startOverlayListeners } from '../../features/Overlay/listeners';
import {
    PORTFOLIO_SWITCH_OPTION_PICKER_ID,
    ERROR_NOTIFICATION_CONTAINER_ID,
    HTML_CONTAINER_ID_PREFIX,
} from '../../features/App/constants';
import { mountAppBeltContainer } from './components/AppBeltContainer';
import { mountAppLoadingSpinner } from './components/AppLoadingSpinner';
import { LOADING_INDICATOR_CSS_SELECTOR } from '@vfde-sails/constants';
import { mountEditorialAccordions } from '../../components/Accordion';
import { mountPortfolioSwitch } from './components/PortfolioSwitch';
import './style.scss';
import { TECHNICAL_DETAILS_ACCORDION_CONTAINER_ID } from '../../features/Options/constants';
import { initTradeIn } from '../TradeIn';

const initApp = ()=>{
    startListeners();
    startOverlayListeners();
    const dispatch = useAppDispatch();

    // Mount re-usable components
    mountAppBeltContainer(ERROR_NOTIFICATION_CONTAINER_ID);
    mountAppBeltContainer(HTML_CONTAINER_ID_PREFIX);
    mountAppLoadingSpinner(LOADING_INDICATOR_CSS_SELECTOR);
    mountPortfolioSwitch(PORTFOLIO_SWITCH_OPTION_PICKER_ID);
    // Mount all editorial accordions at once, except technical details one, because that is mounted and used by code)
    mountEditorialAccordions([TECHNICAL_DETAILS_ACCORDION_CONTAINER_ID]);
    dispatch(startAuthentication());
    initTradeIn();

};

export default initApp;
