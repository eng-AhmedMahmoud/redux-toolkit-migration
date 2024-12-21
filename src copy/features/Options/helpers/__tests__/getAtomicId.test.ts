import {
    SAILS_PARAM_ATOMIC_ID,
    SAILS_PARAM_BTX,
    SAILS_PARAM_CUSTOMER,
    SAILS_PARAM_SALESCHANNEL,
} from '@vfde-sails/constants';
import { getAtomicId } from '../getAtomicId';
import {
    getSessionStorageItemJson,
    SailsVvlStorage,
    Customer,
} from '@vfde-sails/storage';

jest.mock('@vfde-sails/storage', () => ({
    __esModule: true,
    getSessionStorageItemJson: jest.fn(),
}));

describe('getAtomicId', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockCustomer: Customer = {
        isVvlEligible: true,
        isNsfEligible: false,
        isGigakombiEligible: false,
        isSimonlyEligible: true,
        isYoungEligible: false,
        isRedplusEligible: true,
        isWinbackCustomer: false,
        isFriendsAndFamilyCustomer: false,
        isSohoCustomer: false,
    };

    it('Should return null when storage is empty', () => {
        (getSessionStorageItemJson as jest.Mock).mockReturnValue({});
        const result = getAtomicId();
        expect(result).toBeNull();
    });

    it('Should return atomic ID from storage when present', () => {
        const storage: SailsVvlStorage = {
            [SAILS_PARAM_ATOMIC_ID]: '6666',
            [SAILS_PARAM_SALESCHANNEL]: 'consumer',
            [SAILS_PARAM_BTX]: 'redplus',
            [SAILS_PARAM_CUSTOMER]: mockCustomer,
        };
        (getSessionStorageItemJson as jest.Mock).mockReturnValue(storage);
        const result = getAtomicId();
        expect(result).toBe('6666');
    });

    it('Should return null when atomic ID in storage is 0', () => {
        const storage: SailsVvlStorage = {
            [SAILS_PARAM_ATOMIC_ID]: 0,
            [SAILS_PARAM_SALESCHANNEL]: 'consumer',
            [SAILS_PARAM_BTX]: 'redplus',
            [SAILS_PARAM_CUSTOMER]: mockCustomer,
        };
        (getSessionStorageItemJson as jest.Mock).mockReturnValue(storage);
        const result = getAtomicId();
        expect(result).toBeNull();
    });

    it('Should return null when atomic ID in storage is undefined', () => {
        const storage: SailsVvlStorage = {
            [SAILS_PARAM_ATOMIC_ID]: undefined,
            [SAILS_PARAM_SALESCHANNEL]: 'consumer',
            [SAILS_PARAM_BTX]: 'redplus',
            [SAILS_PARAM_CUSTOMER]: mockCustomer,
        };
        (getSessionStorageItemJson as jest.Mock).mockReturnValue(storage);
        const result = getAtomicId();
        expect(result).toBeNull();
    });

    it('Should return "0" when atomic ID in storage is "0"', () => {
        const storage: SailsVvlStorage = {
            [SAILS_PARAM_ATOMIC_ID]: '0',
            [SAILS_PARAM_SALESCHANNEL]: 'consumer',
            [SAILS_PARAM_BTX]: 'redplus',
            [SAILS_PARAM_CUSTOMER]: mockCustomer,
        };
        (getSessionStorageItemJson as jest.Mock).mockReturnValue(storage);
        const result = getAtomicId();
        expect(result).toBe('0');
    });

    it('Should return string value when atomic ID in storage is a number', () => {
        const storage: SailsVvlStorage = {
            [SAILS_PARAM_ATOMIC_ID]: 12345,
            [SAILS_PARAM_SALESCHANNEL]: 'consumer',
            [SAILS_PARAM_BTX]: 'redplus',
            [SAILS_PARAM_CUSTOMER]: mockCustomer,
        };
        (getSessionStorageItemJson as jest.Mock).mockReturnValue(storage);
        const result = getAtomicId();
        expect(result).toBe('12345');
    });
});
