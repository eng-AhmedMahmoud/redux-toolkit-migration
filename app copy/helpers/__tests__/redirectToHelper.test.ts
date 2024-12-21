import { SAILS_VVL_STORAGE } from '@vfde-sails/constants';
import {
    getSessionStorageItemJson,
    setSessionStorageItemJson,
} from '@vfde-sails/storage';
import {
    deleteStorage,
    redirectToDop,
    redirectToMtanPage,
    redirectToPage,
} from 'Helper/redirectToHelper';
import { call } from 'redux-saga/effects';

describe('redirectToHelper', () => {

    describe('redirectToPage', () => {
        let redirectToPageGenerator;
        const pageUrl = 'pageUrl';

        it('should redirect to any page URL', () => {
            redirectToPageGenerator = redirectToPage(pageUrl);
            expect(redirectToPageGenerator.next().value).toEqual(call([window.location, 'assign'], pageUrl));
            expect(redirectToPageGenerator.next().done).toEqual(true);
        });
    });

    describe('redirectToMtanPage', () => {
        let redirectToMtanPageGenerator;

        it('should redirect to mTan page', () => {
            const mTanPageUrl = 'mTanPageUrl';
            (window as any).additionalPageOptions = {
                mTanPageUrl,
            };
            redirectToMtanPageGenerator = redirectToMtanPage();
            redirectToMtanPageGenerator.next();
            redirectToMtanPageGenerator.next();
            expect(redirectToMtanPageGenerator.next().value).toEqual(call(redirectToPage, mTanPageUrl));
            expect(redirectToMtanPageGenerator.next().done).toEqual(true);
        });
    });

    describe('redirectToDop', () => {
        let redirectToDopGenerator;

        it('should redirect to DOP', () => {
            const dopPageUrl = 'dopPageUrl';
            (window as any).additionalPageOptions = {
                dopPageUrl,
            };
            redirectToDopGenerator = redirectToDop();
            expect(redirectToDopGenerator.next().value).toEqual(call(redirectToPage, dopPageUrl));
            expect(redirectToDopGenerator.next().done).toEqual(true);
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
