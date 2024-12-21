import { getTariffOverlayButtonLink } from '../getTariffOverlayButtonLink';
import { getSalesChannel } from '../../../../helpers/getUserDataHelper';
import { mountTariffOverlayButtonLink } from '../../../../components/TariffOverlayButtonLink';
import {
    SALESCHANNEL_CONSUMER,
    SALESCHANNEL_YOUNG,
} from '@vfde-sails/constants';
import {
    GIGAKOMBI_CONSUMER_BUTTON_LINK,
    GIGAKOMBI_YOUNG_BUTTON_LINK,
} from '../../../App/constants';

jest.mock('@vfde-brix/ws10/button-link', () => ({
    BUTTON_LINK_BASE_CLASSNAME: 'ws10-button-link',
}));
jest.mock('@vfde-brix/ws10/overlay', () => ({
    OVERLAY_ALIGNMENT_LEFT: 'left',
}));

jest.mock('@vfde-brix/ws10/core', () => ({
    NO_PATTERN_BUSINESS_LOGIC: {},
}));

jest.mock('@vfde-brix/ws10/promotional-card', () => ({
    PROMOTIONAL_CARD_BASE_CLASSNAME: 'ws10-promotional-card',
}));

jest.mock('../../../../helpers/getUserDataHelper');
jest.mock('../../../../components/TariffOverlayButtonLink');

describe('getTariffOverlayButtonLink', () => {
    const getOverlayContentAction = jest.fn();

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call mountTariffOverlayButtonLink with GIGAKOMBI_YOUNG_BUTTON_LINK when salesChannel is young', () => {
        (getSalesChannel as jest.Mock).mockReturnValue(SALESCHANNEL_YOUNG);

        getTariffOverlayButtonLink(getOverlayContentAction);

        expect(mountTariffOverlayButtonLink).toHaveBeenCalledWith(
            GIGAKOMBI_YOUNG_BUTTON_LINK,
            getOverlayContentAction,
        );
    });

    it('should call mountTariffOverlayButtonLink with GIGAKOMBI_CONSUMER_BUTTON_LINK when salesChannel is consumer', () => {
        (getSalesChannel as jest.Mock).mockReturnValue(SALESCHANNEL_CONSUMER);

        getTariffOverlayButtonLink(getOverlayContentAction);

        expect(mountTariffOverlayButtonLink).toHaveBeenCalledWith(
            GIGAKOMBI_CONSUMER_BUTTON_LINK,
            getOverlayContentAction,
        );
    });

    it('should return null for an unknown salesChannel', () => {
        (getSalesChannel as jest.Mock).mockReturnValue('UNKNOWN_CHANNEL');

        const result = getTariffOverlayButtonLink(getOverlayContentAction);

        expect(result).toBeNull();
        expect(mountTariffOverlayButtonLink).not.toHaveBeenCalled();
    });
});
