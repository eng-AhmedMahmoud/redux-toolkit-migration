import { getTariffOverlayButtonLinkContainerId } from '../TariffOverlayButtonLinkHelpers';
import {
    GIGAKOMBI_IP,
    GIGAKOMBI_TV,
    SALESCHANNEL_CONSUMER,
    SALESCHANNEL_YOUNG,
} from '@vfde-sails/constants';
import {
    GIGAKOMBI_CONSUMER_BUTTON_LINK,
    GIGAKOMBI_YOUNG_BUTTON_LINK,
} from '../../../App/constants';
import { getIsGigaKombiTvOrNotEligible } from '../TariffOverlayButtonLinkHelpers';
import {
    getIsGigakombiEligible,
    getGigakombiType,
} from '../../../../helpers/getUserDataHelper';

jest.mock('../../../../helpers/getUserDataHelper', () => ({
    getIsGigakombiEligible: jest.fn().mockImplementation(() => null),
    getGigakombiType: jest.fn().mockImplementation(() => null),
}));

describe('getTariffOverlayButtonLinkContainerId', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return GIGAKOMBI_YOUNG_BUTTON_LINK when salesChannel is young', () => {
        const containerId = getTariffOverlayButtonLinkContainerId(SALESCHANNEL_YOUNG);

        expect(containerId).toEqual(GIGAKOMBI_YOUNG_BUTTON_LINK);
    });

    it('should return GIGAKOMBI_CONSUMER_BUTTON_LINK when salesChannel is consumer', () => {
        const containerId = getTariffOverlayButtonLinkContainerId(SALESCHANNEL_CONSUMER);

        expect(containerId).toEqual(GIGAKOMBI_CONSUMER_BUTTON_LINK);
    });
});

describe('getIsGigaKombiTvOrNotEligible', () => {
    it('should return true when isGigakombiEligible is false', () => {
        (<jest.Mock>getIsGigakombiEligible).mockImplementation(() => (false));

        const result = getIsGigaKombiTvOrNotEligible();

        expect(result).toBe(true);
    });

    it('should return true when gigakombiType is GIGAKOMBI_TV', () => {
        (<jest.Mock>getGigakombiType).mockImplementation(() => (GIGAKOMBI_TV));

        const result = getIsGigaKombiTvOrNotEligible();

        expect(result).toBe(true);
    });

    it('should return false when isGigakombiEligible is true and gigakombiType is not GIGAKOMBI_TV', () => {
        (<jest.Mock>getIsGigakombiEligible).mockImplementation(() => (true));
        (<jest.Mock>getGigakombiType).mockImplementation(() => (GIGAKOMBI_IP));

        const result = getIsGigaKombiTvOrNotEligible();

        expect(result).toBe(false);
    });
});
