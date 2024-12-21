import {
    toggleElementById,
    toggleTariffOverlayButtonLink,
} from '../../../helpers/domHelper';
import {
    getIsGigaKombiTvOrNotEligible,
    getTariffOverlayButtonLinkContainerId,
} from '../helpers/TariffOverlayButtonLinkHelpers';
import {
    GIGAKOMBI_CONSUMER_BUTTON_LINK,
    GIGAKOMBI_YOUNG_BUTTON_LINK,
} from '../../App/constants';
import { getSalesChannel } from '../../../helpers/getUserDataHelper';
import {
    initializeOverlay,
    mountButtonLink,
} from '../../../components/ButtonLink';
import { TARIFF_OVERLAY_CONTAINER_ID } from '../constants';
import { startAppListening } from '../../../app/listener';
import { selectSalesChannel } from '../../App/selectors';
import { ButtonLink } from '@vfde-brix/ws10/button-link';

/**
 * mount Tarrif Overlay Button Links
 */
export const mountTariffOverlayButtonLinks = () => {
    const isGigaKombiTvOrNotEligible = getIsGigaKombiTvOrNotEligible();

    // hide overlay button links for gigaKombiTV or not Eligible
    if (isGigaKombiTvOrNotEligible) {
        toggleElementById(GIGAKOMBI_CONSUMER_BUTTON_LINK, true);
        toggleElementById(GIGAKOMBI_YOUNG_BUTTON_LINK, true);

        return;
    }

    // mount overlay button link based on sales channel
    mountOverlayButtonLink();
    listenForUpdate();
};

/**
 * Mount Button Link component
 */
const mountOverlayButtonLink = (
): ButtonLink | null => {

    const salesChannel = getSalesChannel()!;

    toggleTariffOverlayButtonLink(salesChannel);
    const containerId = getTariffOverlayButtonLinkContainerId(salesChannel);
    const tariffButtonLink = mountButtonLink(containerId);

    /* istanbul ignore if */
    if (!tariffButtonLink) {
        return null;
    }

    initializeOverlay(
        document.getElementById(containerId),
        TARIFF_OVERLAY_CONTAINER_ID,
    );

    return tariffButtonLink;
};

/**
 * listner to update mountTariffOverlayButtonLinks
 */
const listenForUpdate = () => {
    startAppListening({
        predicate: (_action, currentState, previousState) => selectSalesChannel(currentState) !== selectSalesChannel(previousState)
        ,
        effect: () => {
            mountOverlayButtonLink();
        },
    });
};
