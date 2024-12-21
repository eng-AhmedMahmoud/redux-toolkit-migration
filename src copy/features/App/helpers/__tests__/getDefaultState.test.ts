import { getDefaultState } from '../getDefaultState';
import {
    getDeviceId,
    getGigakombiType,
    getIsGigakombiEligible,
    getIsSimonlyEligible,
    getIsYoungEligible,
    getSalesChannel,
} from '../../../../helpers/getUserDataHelper';
import { getIsTradeIn } from '../../../../helpers/getTradeInHelpers';
import {
    getIsTauschbonus,
    getIsTauschbonusEligible,
} from '../../../../helpers/getTauschbonusHelpers';
import {
    SAILS_PARAM_SALESCHANNEL,
    SALESCHANNEL_CONSUMER,
} from '@vfde-sails/constants';
import { getSessionStorageItemJson } from '@vfde-sails/storage';
jest.mock('@vfde-brix/ws10/core', () => ({
    NO_PATTERN_BUSINESS_LOGIC: {},
}));

jest.mock('@vfde-brix/ws10/promotional-card', ()=>({}));
jest.mock('@vfde-sails/storage', () => ({
    getSessionStorageItemJson: jest.fn().mockImplementation(() => null),
}));
jest.mock('../../../../helpers/getUserDataHelper', () => ({
    ...jest.requireActual('../../../../helpers/getUserDataHelper'), // Preserve actual implementation
    getSalesChannel: jest.fn(),
    getDeviceId: jest.fn(),
    getIsSimonlyEligible: jest.fn(),
    getIsYoungEligible: jest.fn(),
    getIsGigakombiEligible: jest.fn(),
    getGigakombiType: jest.fn(),
}));
jest.mock('../../../../helpers/getTradeInHelpers', () => ({
    ...jest.requireActual('../../../../helpers/getTradeInHelpers'), // Preserve actual implementation
    getIsTradeIn: jest.fn(),
}));
jest.mock('../../../../helpers/getTauschbonusHelpers', () => ({
    ...jest.requireActual('../../../../helpers/getTauschbonusHelpers'), // Preserve actual implementation
    getIsTauschbonus: jest.fn(),
    getIsTauschbonusEligible: jest.fn(),
}));

describe('getDefaultState', () => {

    it('Should return the default state', () => {

        const expectedResults = {
            salesChannel: SALESCHANNEL_CONSUMER,
            deviceId: '123',
            isSimonlyEligible: true,
            isYoungEligible: true,
            isGigakombiEligible: true,
            gigakombiType: 'iptv',
            isTradeIn: true,
            isTauschbonus: true,
            isTauschbonusEligible: true,
        };

        (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => ({
            [SAILS_PARAM_SALESCHANNEL]: SALESCHANNEL_CONSUMER,

        }));
        (getSalesChannel as jest.Mock).mockReturnValue(SALESCHANNEL_CONSUMER);
        (getDeviceId as jest.Mock).mockReturnValue('123');
        (getIsSimonlyEligible as jest.Mock).mockReturnValue(true);
        (getIsYoungEligible as jest.Mock).mockReturnValue(true);
        (getIsGigakombiEligible as jest.Mock).mockReturnValue(true);
        (getGigakombiType as jest.Mock).mockReturnValue('iptv');
        (getIsTradeIn as jest.Mock).mockReturnValue(true);
        (getIsTauschbonus as jest.Mock).mockReturnValue(true);
        (getIsTauschbonusEligible as jest.Mock).mockReturnValue(true);
        const defaultState = getDefaultState();
        expect(defaultState).toEqual(expectedResults);
    });
});
