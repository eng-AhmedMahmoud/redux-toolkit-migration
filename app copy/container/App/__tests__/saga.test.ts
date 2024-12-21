import {
    ADDITIONAL_PAGE_OPTIONS,
    SAILS_PARAM_DEVICE_ID,
    SAILS_PARAM_SALESCHANNEL,
    SAILS_VVL_STORAGE,
    SALESCHANNEL_CONSUMER,
    URL_PARAM_SUBGROUP_ID,
} from '@vfde-sails/constants';
import {
    VVL_AUTH_DONE,
    VVL_REDPLUS_ELIGIBILITY_DONE,
} from '@vfde-sails/vvl';
import {
    SailsVvlStorage,
    updateStorage,
} from '@vfde-sails/storage';
import { redirectToDop } from 'Helper/redirectToHelper';
import {
    call,
    put,
    StrictEffect,
    takeLatest,
} from 'redux-saga/effects';
import vvlHardwareDetailSaga, {
    authDoneSaga,
    goToBasketSaga,
    goToFamilyCardSaga,
    setIsRedplusEligibleSaga,
    setSalesChannelSaga,
} from '../saga';
import mountOptionsContainer from '../../Options';
import { updateUrl } from '@vfde-sails/utils';
import {
    goToBasket,
    goToFamilyCard,
    setDefaultState,
    setIsRedplusEligible,
    setSalesChannel,
} from '../slice';
import { getDevice } from '../../Options/slice';
import { AdditionalPageOptions } from '../interfaces/additionalPageOptions';
import { getIsTauschbonusEligible } from 'Helper/getTauschbonusHelpers';

jest.mock('../../../helpers/redirectToHelper', () => ({
    redirectToDop: jest.fn(),
    redirectToMtanPage: jest.fn(),
}));

jest.mock('@vfde-sails/page-options', () => ({
    ...jest.requireActual('@vfde-sails/page-options'),
    __esModule: true,
    getDeviceDiscountSoc: jest.fn().mockImplementation(() => []),
    getDefaultDiscountSocs: jest.fn().mockImplementation(() => []),
}));

jest.mock('@vfde-brix/ws10/styles', () => ({
    CLASSNAME_HIDDEN: 'ws10-hidden',
}));

jest.mock('@vfde-brix/ws10/button-link', () => ({
    BUTTON_LINK_BASE_CLASSNAME: 'ws10-button-link',
}));

jest.mock('@vfde-brix/ws10/notification', () => ({
    NOTIFICATION_BASE_CLASSNAME: 'ws10-notification',
}));

jest.mock('@vfde-brix/ws10/headline', () => ({
    HEADLINE_BASE_CLASSNAME: 'ws10-headline',
}));

jest.mock('@vfde-brix/ws10/option-picker', () => ({
    OPTION_PICKER_INPUT_CLASSNAME: 'ws10-option-picker__input',
}));

jest.mock('@vfde-brix/ws10/offer-summary-card', () => ({
    OFFER_SUMMARY_CARD_PRICE_CLASSNAME: 'ws10-offer-summary-card',
}));

jest.mock('@vfde-brix/ws10/sticky-price-bar', () => ({
    STICKY_PRICE_BAR_VISIBLE_CLASSNAME: 'ws10-sticky-price-bar',
}));

jest.mock('@vfde-brix/ws10/unordered-horizontal-list', () => ({
    createUnorderedHorizontalList: jest.fn().mockImplementation(() => []),
}));

jest.mock('@vfde-brix/ws10/core', () => ({
    NO_PATTERN_BUSINESS_LOGIC: {},
}));

jest.mock('@vfde-brix/ws10/overlay', () => ({
    OVERLAY_ALIGNMENT_LEFT: 'left',
}));

jest.mock('@vfde-brix/ws10/accordion', () => ({
    ACCORDION_BASE_CLASSNAME: 'ws10-accordion',
}));

jest.mock('@vfde-brix/ws10/system-icon', () => ({
    SYSTEM_ICON_5G: '5g',
    SYSTEM_ICON_55_PLUS: '5g-plus',
}));

jest.mock('@vfde-brix/ws10/promo-price', () => ({
    PROMO_PRICE_SIZE_MEDIUM: 'medium',
}));

jest.mock('@vfde-brix/ws10/table', () => ({
    ITableProperties: {},
}));

jest.mock('@vfde-brix/ws10/promotional-card', () => ({
    IPromotionalCardProperties: {},
}));

jest.mock('@vfde-brix/ws10/image-gallery', () => ({
    ImageGallery: {},
}));

jest.mock('@vfde-brix/ws10/icon-text', () => ({
    IconText: {},
}));

jest.mock('@vfde-brix/ws10/text-header', () => ({
    TextHeader: {},
}));

jest.mock('@vfde-brix/ws10/item-summary-card', () => ({
    ItemSummaryCard: {},
}));

jest.mock('../../../helpers/getTauschbonusHelpers', () => ({
    ...jest.requireActual('../../../helpers/getTauschbonusHelpers'),
    getIsTauschbonusEligible: jest.fn(),
}));

const mockOfferSummaryCardFromCms = {
    offerSummaryCard: {
        familyCardLink: '/privat/vertragsverlaengerung/vvl-zusatzkarte.html',
    },
};

describe('VVL hardwareDetail Sagas', () => {
    describe('hardwareDetailSaga', () => {
        const generator = vvlHardwareDetailSaga();

        it('should start watch tasks in the correct order', () => {
            expect(generator.next().value).toEqual(takeLatest(VVL_AUTH_DONE, authDoneSaga));
            expect(generator.next().value).toEqual(takeLatest(setSalesChannel.type, setSalesChannelSaga));
            expect(generator.next().value).toEqual(takeLatest(VVL_REDPLUS_ELIGIBILITY_DONE, setIsRedplusEligibleSaga));
            expect(generator.next().value).toEqual(takeLatest(goToBasket.type, goToBasketSaga));
            expect(generator.next().value).toEqual(takeLatest(goToFamilyCard.type, goToFamilyCardSaga));
            expect(generator.next().done).toBe(true);
        });
    });

    describe('authDoneSaga', () => {
        let authDoneSagaGenerator;

        it('should call setDefaultState action', () => {
            authDoneSagaGenerator = authDoneSaga();
            authDoneSagaGenerator.next();
            (getIsTauschbonusEligible as jest.Mock).mockReturnValue(true);
            const putDescriptor = authDoneSagaGenerator.next([SALESCHANNEL_CONSUMER, '1234', true, true, true, 'tv', true, true]).value;
            expect(putDescriptor).toEqual(put(setDefaultState(SALESCHANNEL_CONSUMER, '1234', true, true, true, 'tv', true, true, true)));
        });

        it('should call mountOptionsContainer when there is a deviceId', () => {
            authDoneSagaGenerator = authDoneSaga();
            authDoneSagaGenerator.next();
            authDoneSagaGenerator.next([SALESCHANNEL_CONSUMER, 1234]);
            authDoneSagaGenerator.next();
            const putDescriptor = authDoneSagaGenerator.next().value;
            expect(putDescriptor).toEqual(call(mountOptionsContainer));
            expect(authDoneSagaGenerator.next().done).toEqual(true);
        });

        it('should redirect to DOP when there is no deviceId', () => {
            authDoneSagaGenerator = authDoneSaga();
            authDoneSagaGenerator.next();
            authDoneSagaGenerator.next([SALESCHANNEL_CONSUMER, undefined]);
            authDoneSagaGenerator.next();
            const callDescriptor = authDoneSagaGenerator.next().value;
            expect(callDescriptor).toEqual(call(redirectToDop));
            expect(authDoneSagaGenerator.next().done).toEqual(true);
        });

        it('should save salesChannel and device Id in storage', () => {
            authDoneSagaGenerator = authDoneSaga();
            authDoneSagaGenerator.next();
            authDoneSagaGenerator.next([SALESCHANNEL_CONSUMER, '1234']);
            const putDescriptor = authDoneSagaGenerator.next().value;

            const expected = call(updateStorage<SailsVvlStorage>, SAILS_VVL_STORAGE, {
                [SAILS_PARAM_SALESCHANNEL]: SALESCHANNEL_CONSUMER,
                [SAILS_PARAM_DEVICE_ID]: '1234',
            }, null, { shouldDeepMerge: true });
            authDoneSagaGenerator.next();

            expect(putDescriptor).toEqual(expected);
            expect(authDoneSagaGenerator.next().done).toEqual(true);
        });
    });

    describe('setSalesChannelSaga', () => {
        let setSalesChannelSagaGenerator;

        it('should save salesChannel in storage', () => {
            setSalesChannelSagaGenerator = setSalesChannelSaga({ payload: SALESCHANNEL_CONSUMER } as unknown as Parameters<typeof setSalesChannelSaga>[0]);
            const putDescriptor = setSalesChannelSagaGenerator.next().value;

            const expected = call(updateStorage<SailsVvlStorage>, SAILS_VVL_STORAGE, {
                [SAILS_PARAM_SALESCHANNEL]: SALESCHANNEL_CONSUMER,
            }, null, { shouldDeepMerge: true });

            expect(putDescriptor).toEqual(expected);
            setSalesChannelSagaGenerator.next();
            expect(setSalesChannelSagaGenerator.next().done).toBeTruthy();
        });

        it('should call getDevice action', () => {
            setSalesChannelSagaGenerator = setSalesChannelSaga({ payload: SALESCHANNEL_CONSUMER } as Parameters<typeof setSalesChannelSaga>[0]);
            setSalesChannelSagaGenerator.next();
            const putDescriptor = setSalesChannelSagaGenerator.next().value;

            expect(putDescriptor).toEqual(put(getDevice()));
            expect(setSalesChannelSagaGenerator.next().done).toBeTruthy();
        });

        it('should remove tariffId from parameters', () => {
            const { location } = window;
            delete (window as any).location;
            (window as any).location = new URL(`https://www.example.com?${URL_PARAM_SUBGROUP_ID}=123`);

            setSalesChannelSagaGenerator = setSalesChannelSaga({ payload: SALESCHANNEL_CONSUMER } as Parameters<typeof setSalesChannelSaga>[0]);
            expect(setSalesChannelSagaGenerator.next('').value).toEqual(call(updateUrl, 'https://www.example.com/', true));
            setSalesChannelSagaGenerator.next();
            const putDescriptor = setSalesChannelSagaGenerator.next().value;
            expect(putDescriptor).toEqual(put(getDevice()));
            expect(setSalesChannelSagaGenerator.next().done).toBeTruthy();

            window.location = location;
        });
    });

    describe('goToBasketSaga', () => {
        let goToBasketSagaGenerator: Generator<StrictEffect>;

        beforeEach(() => {
            goToBasketSagaGenerator = goToBasketSaga();
        });

        it('should redirect to basket', () => {
            goToBasketSagaGenerator.next();
            const putDescriptor = goToBasketSagaGenerator.next('/shop/warenkorb.html#ey').value;
            const expected = call([window.location, 'assign'], expect.stringContaining('/shop/warenkorb.html#ey'));

            expect(putDescriptor).toEqual(expected);
            expect(goToBasketSagaGenerator.next().done).toBeTruthy();
        });
    });

    describe('goToFamilyCardSaga', () => {
        let goToFamilyCardSagaGenerator: Generator<StrictEffect>;

        beforeEach(() => {
            goToFamilyCardSagaGenerator = goToFamilyCardSaga();
            window[ADDITIONAL_PAGE_OPTIONS] = mockOfferSummaryCardFromCms as AdditionalPageOptions;
        });

        it('should redirect to family card`                 ', () => {
            const putDescriptor = goToFamilyCardSagaGenerator.next('privat/vertragsverlaengerung/vvl-zusatzkarte.html').value;
            const expected = call([window.location, 'assign'], expect.stringContaining('privat/vertragsverlaengerung/vvl-zusatzkarte.html'));

            expect(putDescriptor).toEqual(expected);
            expect(goToFamilyCardSagaGenerator.next().done).toBeTruthy();
        });
    });

    describe('setIsRedplusEligibleSaga', () => {
        let setIsRedplusEligibleSagaGenerator: Generator<StrictEffect>;

        beforeEach(() => {
            setIsRedplusEligibleSagaGenerator = setIsRedplusEligibleSaga();
        });

        it('should dispatch setIsRedplusEligible', () => {
            const putDescriptor = setIsRedplusEligibleSagaGenerator.next().value;

            expect(putDescriptor).toEqual(put(setIsRedplusEligible(false)));
            expect(setIsRedplusEligibleSagaGenerator.next().done).toBeTruthy();
        });
    });
});
