import { SAILS_VVL_STORAGE } from '@vfde-sails/constants';
import {
    getSessionStorageItemJson,
    setSessionStorageItemJson,
} from '@vfde-sails/storage';
import {
    deleteStorage,
    redirectToDop,
    redirectToPage,
} from '../redirectToHelper';

jest.mock('../redirectToHelper', () => ({
    ...jest.requireActual('../redirectToHelper'),
}));
describe('redirectToHelper', () => {
    describe('redirectToPage', () => {
        const pageUrl = 'pageUrl';

        it('should redirect to any page URL', () => {
            delete (window as any).location;
            (window as any).location = {
                assign: jest.fn(),
            };
            redirectToPage(pageUrl);

            expect(window.location.assign).toHaveBeenNthCalledWith(1, pageUrl);
        });
    });

    describe('redirectToDop', () => {
        it('should redirect to DOP', () => {
            const dopPageUrl = 'dopPageUrl';
            (window as any).additionalPageOptions = {
                dopPageUrl,
            };
            delete (window as any).location;
            (window as any).location = {
                assign: jest.fn(),
            };

            redirectToDop();
            expect(window.location.assign).toHaveBeenNthCalledWith(1, dopPageUrl);

        });
    });

    describe('deleteStorage', () => {

        it('should delete storage item', () => {
            const vvlStorage = { btx: 'vvl' };
            setSessionStorageItemJson(SAILS_VVL_STORAGE, vvlStorage);
            deleteStorage(SAILS_VVL_STORAGE);
            expect(getSessionStorageItemJson(SAILS_VVL_STORAGE)).toEqual(null);
        });
    });
});
