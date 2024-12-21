import { ButtonLink } from '@vfde-brix/ws10/button-link';
import { startAppListening } from '../../../app/listener';
import {
    initializeOverlay,
    mountButtonLink,
} from '../../../components/ButtonLink';
import {
    selectIsTauschbonus,
    selectIsTauschbonusEligible,
    selectIsTradeIn,
} from '../../../features/App/selectors';
import {
    TAUSCHBONUS_OVERLAY,
    TAUSCHBONUS_OVERLAY_BUTTON_LINK,
    TRADE_IN_OVERLAY,
    TRADE_IN_OVERLAY_BUTTON_LINK,
} from '../constants';
import { toggleElementById } from '../../../helpers/domHelper';

/**
 * Mount ButtonLink for TradeIn
 */
export const mountButtonLinkForTradeIn = (containerId: string): ButtonLink | null => {
    const buttonLink = mountButtonLink(containerId);

    /* istanbul ignore if */
    if (!buttonLink) {
        return null;
    }

    listenForUpdates(buttonLink);

    return buttonLink;
};

const listenForUpdates = (buttonLink: ButtonLink) => {
    startAppListening({
        predicate: (_action, currentState, previousState) =>
            selectIsTradeIn(currentState) !== selectIsTradeIn(previousState) ||
            selectIsTauschbonus(currentState) !== selectIsTauschbonus(previousState),
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const isTauschbonusEligible = selectIsTauschbonusEligible(state);
            const isTauschbonus = selectIsTauschbonus(state);
            const isTradeIn = selectIsTradeIn(state);

            const overlayButtonLink = isTauschbonusEligible ? TAUSCHBONUS_OVERLAY_BUTTON_LINK : TRADE_IN_OVERLAY_BUTTON_LINK;
            const overlayType = isTauschbonus ? TAUSCHBONUS_OVERLAY : TRADE_IN_OVERLAY;

            if (isTradeIn && buttonLink) {
                initializeOverlay(
                    document.getElementById(overlayButtonLink),
                    overlayType,
                );
            }

            toggleElementById(overlayButtonLink, !isTradeIn);
        },
    });
};
