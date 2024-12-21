import {
    GIGAKOMBI_TV,
    SalesChannel,
    SALESCHANNEL_CONSUMER,
    SALESCHANNEL_YOUNG,
} from '@vfde-sails/constants';
import {
    GIGAKOMBI_CONSUMER_BUTTON_LINK,
    GIGAKOMBI_YOUNG_BUTTON_LINK,
} from '../../App/constants';
import {
    getGigakombiType,
    getIsGigakombiEligible,
} from '../../../helpers/getUserDataHelper';

/**
 gets TariffOverlayButtonLink containerId based on sales channel
 */
export const getTariffOverlayButtonLinkContainerId = (
    salesChannel: SalesChannel,
) => {
    const containerIds: Partial<Record<SalesChannel, string>> = {
        [SALESCHANNEL_CONSUMER]: GIGAKOMBI_CONSUMER_BUTTON_LINK,
        [SALESCHANNEL_YOUNG]: GIGAKOMBI_YOUNG_BUTTON_LINK,
    };

    return containerIds[salesChannel] as string;
};

/**
 gets isGigaKombitTvOrNotEligble based on sales channel
 */
export const getIsGigaKombiTvOrNotEligible = () => {
    const isGigakombiEligible = getIsGigakombiEligible();
    const gigakombiType = getGigakombiType();
    const isGigaKombiTv = gigakombiType === GIGAKOMBI_TV;
    const isGigaKombiTvOrNotEligible = !isGigakombiEligible || isGigaKombiTv;

    return isGigaKombiTvOrNotEligible;
};
