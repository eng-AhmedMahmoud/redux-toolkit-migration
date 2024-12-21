import {
    SALESCHANNEL_CONSUMER,
    SALESCHANNEL_YOUNG,
} from '@vfde-sails/constants';
import { mountTariffOverlayButtonLink } from '../../../components/TariffOverlayButtonLink';
import {
    GIGAKOMBI_CONSUMER_BUTTON_LINK,
    GIGAKOMBI_YOUNG_BUTTON_LINK,
} from '../../App/constants';
import { AppActionDispatchers } from '../../App/slice';
import { getSalesChannel } from '../../../helpers/getUserDataHelper';

/**
 mounts the TariffOverlayButtonLink based on sales channel
 */
export const getTariffOverlayButtonLink = (
    getOverlayContentAction: AppActionDispatchers['getOverlayContent'],
) => {
    const salesChannel = getSalesChannel();

    switch (salesChannel) {
        case SALESCHANNEL_YOUNG:
            mountTariffOverlayButtonLink(GIGAKOMBI_YOUNG_BUTTON_LINK, getOverlayContentAction);
            break;
        case SALESCHANNEL_CONSUMER:
            mountTariffOverlayButtonLink(GIGAKOMBI_CONSUMER_BUTTON_LINK, getOverlayContentAction);
            break;
        default:
            return null;
    }
};
