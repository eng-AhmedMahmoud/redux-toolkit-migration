import { SAILS_PARAM_ATOMIC_ID } from '@vfde-sails/constants';
import { getSessionStorageItemJson } from '@vfde-sails/storage';
import { getAtomicId } from '../getAtomicId';

jest.mock('@vfde-sails/storage', () => ({
    getSessionStorageItemJson: jest.fn(),
}));

describe('getAtomicId', () => {

    it('Should return null if no storage object', () => {
        (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => null);
        const expected = getAtomicId();
        expect(expected).toBe(null);
    });

    it('Should get atomicId from storage', () => {
        const storage: any = {
            [SAILS_PARAM_ATOMIC_ID]: '8888',
        };
        (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => storage);
        const expected = getAtomicId();
        expect(expected).toBe('8888');
    });
});
