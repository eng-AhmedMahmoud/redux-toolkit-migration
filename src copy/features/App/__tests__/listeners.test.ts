import {
    UnsubscribeListener,
    configureStore,
} from '@reduxjs/toolkit';
import { listener } from '../../../app/listener';
import {
    listeners,
    startListeners,
} from '../listeners';
import { startAuthentication } from '@vfde-sails/vvl';
import { updateStorage } from '@vfde-sails/storage';
import * as appSlice from '../slice';
import {
    ADDITIONAL_PAGE_OPTIONS,
    SALESCHANNEL_CONSUMER,
    URL_PARAM_SUBGROUP_ID,
} from '@vfde-sails/constants';
import { initOptions } from '../../Options/index';
import {
    redirectToDop,
    redirectToPage,
} from '../../../helpers/redirectToHelper';
import {
    createUrlWithQueryString,
    hasQueryParam,
    updateUrl,
} from '@vfde-sails/utils';
import { generateDeeplinkHelper } from '../../../helpers/generateDeeplinkHelper';
import { AdditionalPageOptions } from '../interfaces/additionalPageOptions';

jest.mock('@vfde-brix/ws10/promotional-card', ()=>({}));

jest.mock('@vfde-sails/utils', () => ({
    ...jest.requireActual('@vfde-sails/utils'),
    hasQueryParam: jest.fn(),
    updateUrl: jest.fn(),
    createUrlWithQueryString: jest.fn(),
}));

jest.mock('../../../helpers/generateDeeplinkHelper', ()=>({
    generateDeeplinkHelper: jest.fn(),
}));

jest.mock('@vfde-brix/ws10/accordion', () => ({
    createAccordion: jest.fn().mockReturnValue({}),
}));

jest.mock('@vfde-brix/ws10/styles', () => ({
    styles: jest.fn().mockReturnValue({}),
}));

jest.mock('@vfde-brix/ws10/table', () => ({
    createTable: jest.fn().mockReturnValue({}),
}));

jest.mock('@vfde-brix/ws10/icon-text', () => ({
    createIconText: jest.fn().mockReturnValue({}),
}));

jest.mock('@vfde-brix/ws10/image-gallery', () => ({
    createImageGallery: jest.fn().mockReturnValue({}),
}));

jest.mock('@vfde-brix/ws10/system-icon', () => ({
    createSystemIcon: jest.fn().mockReturnValue({}),
}));

jest.mock('@vfde-brix/ws10/option-picker', () => ({
    createOptionPicker: jest.fn().mockReturnValue({}),
}));

jest.mock('@vfde-brix/ws10/text-header', () => ({
    createTextHeader: jest.fn().mockReturnValue({}),
}));

jest.mock('@vfde-brix/ws10/core', () => ({
    /* eslint-disable @typescript-eslint/naming-convention */
    NO_PATTERN_BUSINESS_LOGIC: jest.fn().mockReturnValue({}),
    /* eslint-enable @typescript-eslint/naming-convention */
}));

jest.mock('@vfde-sails/storage', () => ({
    ...jest.requireActual('@vfde-sails/storage'),
    updateStorage: jest.fn(),
}));

jest.mock('../../Options/index.ts', () => ({
    initOptions: jest.fn(),
}));

jest.mock('../../../helpers/redirectToHelper.ts', () => ({
    ...jest.requireActual('../../../helpers/redirectToHelper.ts'),
    redirectToPage: jest.fn(),
    redirectToDop: jest.fn(),
}));

const createStoreForTest = () => configureStore({
    reducer: state => state,
    middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(listener.middleware),
});

describe('App Listeners', () => {
    const originalLocation = window.location;

    afterEach(() => {
        jest.clearAllMocks(); // clear calls of mocks created with jest.mock
        jest.restoreAllMocks(); // restores implementation of spies created with jest.spyOn
        window.location = originalLocation;
    });

    it('startListeners', () => {
        expect(() => {
            startListeners()();
        }).not.toThrow();
    });

    describe('startAuthenticationFulfilled', () => {
        let unsubscribe: UnsubscribeListener;

        beforeAll(() => {
            unsubscribe = listeners.startAuthenticationFulfilled();
        });

        afterAll(() => {
            unsubscribe();
        });

        it('should dispatch the next actions', () => {
            const dispatchMock = jest.fn();
            const defaultState = {
                salesChannel: 'consumer',
                deviceId: '51',
                isSimonlyEligible: false,
                isYoungEligible: false,
                isGigakombiEligible: false,
                gigakombiType: '',
                isTradeIn: false,
                isTauschbonus: false,
                isTauschbonusEligible: false,
                isVvlEligible: true,
                isRedplusEligible: true,
                isWinbackCustomer: false,
                isFriendsAndFamilyCustomer: false,
            };
            listener.middleware({
                dispatch: dispatchMock,
                getState: jest.fn(),
            })(() => (action: any) => action)({
                type: `${startAuthentication.typePrefix}/fulfilled`,
                payload: defaultState,
            });
            // expect 'setDefaultState' action function to have been dispatched
            expect(dispatchMock).toHaveBeenCalled();
        });
    });
    describe('startAuthenticationRejected', () => {
        let unsubscribe: UnsubscribeListener;

        beforeAll(() => {
            unsubscribe = listeners.startAuthenticationRejected();
        });

        afterAll(() => {
            unsubscribe();
        });

        it('should redirect to MTan page', () => {
            delete (window as any).location;

            const store = createStoreForTest();
            const payload = '/shop/authentifizierung.html?btype=vvl&goto=%2Fvvl-tarifauswahl-mit-smartphone.html%3FdeviceId%3D51';
            store.dispatch({
                type: `${startAuthentication.typePrefix}/rejected`,
                payload,
            });

            expect(redirectToPage).toHaveBeenCalledWith(payload);

        });
    });
    describe('setDefaultState', () => {
        let unsubscribe: UnsubscribeListener;

        beforeAll(() => {
            unsubscribe = listeners.setDefaultState();
        });

        afterAll(() => {
            unsubscribe();
        });

        it('should update the storage', () => {
            const store = createStoreForTest();
            const payload = { salesChannel: SALESCHANNEL_CONSUMER, deviceId: '52', isTradeIn: true, isTauschbonusEligible: true };
            store.dispatch({
                type: `${appSlice.setDefaultState}`,
                payload,
            });
            expect(updateStorage).toHaveBeenCalled();
        });
        it('should call initOptions if the device id is exist', () => {
            const store = createStoreForTest();
            const payload = { salesChannel: SALESCHANNEL_CONSUMER, deviceId: '52', isTradeIn: true, isTauschbonusEligible: true };
            store.dispatch({
                type: `${appSlice.setDefaultState}`,
                payload,
            });
            expect(initOptions).toHaveBeenCalled();
        });
        it('should call redirectToDop function if the device id is not exist', () => {
            const store = createStoreForTest();
            const payload = { salesChannel: SALESCHANNEL_CONSUMER, deviceId: null, isTradeIn: true, isTauschbonusEligible: true };
            store.dispatch({
                type: `${appSlice.setDefaultState}`,
                payload,
            });
            expect(redirectToDop).toHaveBeenCalled();
        });

    });
    describe('setSalesChannel', () => {
        let unsubscribe: UnsubscribeListener;

        beforeAll(() => {
            unsubscribe = listeners.setSalesChannel();
        });

        afterAll(() => {
            unsubscribe();
        });

        it('should delete tariffID from the url if exist', () => {
            const store = createStoreForTest();
            const payload = { salesChannel: SALESCHANNEL_CONSUMER };

            store.dispatch({
                type: `${appSlice.setSalesChannel}`,
                payload,
            });
            (hasQueryParam as jest.Mock).mockReturnValueOnce(true);
            expect(updateUrl).toHaveBeenNthCalledWith(1, updateUrl(createUrlWithQueryString(URL_PARAM_SUBGROUP_ID, '')));
        });

        it('should update the storage', () => {
            const store = createStoreForTest();
            const payload = { salesChannel: SALESCHANNEL_CONSUMER };
            store.dispatch({
                type: `${appSlice.setSalesChannel}`,
                payload,
            });
            expect(updateStorage).toHaveBeenCalled();
        });

        it('should dispatch getHardwareDetailGroup api', () => {
            const dispatchMock = jest.fn();
            const payload = { salesChannel: SALESCHANNEL_CONSUMER };
            listener.middleware({
                dispatch: dispatchMock,
                getState: jest.fn(),
            })(() => (action: any) => action)({
                type: `${appSlice.setSalesChannel}`,
                payload,
            });
            expect(dispatchMock).toHaveBeenCalled();
        });
    });
    describe('goToBasket', () => {
        let unsubscribe: UnsubscribeListener;

        beforeAll(() => {
            unsubscribe = listeners.goToBasket();
        });

        afterAll(() => {
            unsubscribe();
        });

        it('should call generateDeeplinkHelper function', () => {
            const store = createStoreForTest();
            store.dispatch({
                type: `${appSlice.goToBasket}`,
            });
            expect(generateDeeplinkHelper).toHaveBeenCalled();
        });

        it('should redirect to basket', () =>{
            const basketUrl = 'basketUrl';

            (generateDeeplinkHelper as jest.Mock).mockReturnValueOnce(basketUrl);

            delete (window as any).location;

            (window as any).location = {
                assign: jest.fn(),
            };

            const store = createStoreForTest();
            store.dispatch({
                type: `${appSlice.goToBasket}`,
            });
            expect(window.location.assign).toHaveBeenCalledTimes(1);
            expect(window.location.assign).toHaveBeenNthCalledWith(1, basketUrl);

        });
    });
    describe('goToFamilyCard', () => {
        let unsubscribe: UnsubscribeListener;

        beforeAll(() => {
            unsubscribe = listeners.goToFamilyCard();
        });

        afterAll(() => {
            unsubscribe();
        });

        it('should redirect to theFamilyCard ', () => {

            window[ADDITIONAL_PAGE_OPTIONS] = {
                offerSummaryCard: { familyCardLink: 'familyCardUrl' },
            } as AdditionalPageOptions;

            delete (window as any).location;

            (window as any).location = {
                assign: jest.fn(),
            };

            const store = createStoreForTest();
            store.dispatch({
                type: `${appSlice.goToFamilyCard}`,
            });
            const familyCardUrl = window[ADDITIONAL_PAGE_OPTIONS].offerSummaryCard.familyCardLink;
            expect(window.location.assign).toHaveBeenNthCalledWith(1, familyCardUrl);
        });
    });

});
