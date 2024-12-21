import {
    API_BTX_VVL,
    API_SALESCHANNEL_CONSUMER,
    GIGAKOMBI_TV,
    RED_M_VIRTUAL_ID,
    RedTariff,
    SAILS_PARAM_SUB_ID,
    SAILS_VVL_STORAGE,
    SALESCHANNEL_CONSUMER,
    URL_PARAM_SUBGROUP_ID,
    YoungTariff,
} from '@vfde-sails/constants';
import {
    StrictEffect,
    call,
    put,
    takeLatest,
} from 'redux-saga/effects';
import tariffSaga, {
    getSubscriptionsSaga,
    setSubscriptionIdSaga,
    setSubscriptionIdInStorageSaga,
} from '../saga';
import {
    SailsVvlStorage,
    updateStorage as updateStorageHelper,
} from '@vfde-sails/storage';
import { updateUrl } from '@vfde-sails/utils';
import {
    TrackType,
    addTrackingToAction,
} from '@vfde-sails/tracking';
import {
    GladosServiceFactory,
    TariffWithHardwareResponse,
} from '@vfde-sails/glados-v2';
import {
    getSubscriptions,
    getSubscriptionsFailed,
    getSubscriptionsSuccess,
    setDefaultState,
    setSubscriptionId,
} from '../slice';
import {
    setSalesChannel,
    trackPageView,
} from '../../App/slice';

jest.mock('@vfde-brix/ws10/styles', () => ({
    CLASSNAME_HIDDEN: 'ws10-hidden',
}));

jest.mock('@vfde-brix/ws10/option-picker', () => ({
    OPTION_PICKER_INPUT_CLASSNAME: 'ws10-option-picker__input',
}));

jest.mock<typeof import('@vfde-sails/page-options')>('@vfde-sails/page-options', () => ({
    ...jest.requireActual('@vfde-sails/page-options'),
    getAllDiscounts: jest.fn().mockReturnValue(['1', '2']),
}));

const key = 'secret';
const url = 'https://www.vodafone.de/foo';

jest.mock('@vfde-sails/utils', () => ({
    ...jest.requireActual('@vfde-sails/utils'),
    getApiConfig: jest.fn().mockReturnValue({
        url,
        key,
        queryParams: {
            salesChannel: 'salesChannel',
            btx: 'businessTransaction',
            subscription: 'tariffGroupId',
            device: 'hardwareId',
            discount: 'discountId',
        },
    }),
    requestJson: jest.fn(),
    getQueryParam: jest.fn(),
}));

describe('Tariff Sagas', () => {
    describe('tariffSaga', () => {
        const generator = tariffSaga();

        it('should start watch tasks in the correct order', () => {
            expect(generator.next().value).toEqual(takeLatest(setDefaultState.type, setSubscriptionIdSaga));
            expect(generator.next().value).toEqual(takeLatest(setSalesChannel.type, setSubscriptionIdSaga));
            expect(generator.next().value).toEqual(takeLatest(getSubscriptions.type, getSubscriptionsSaga));
            expect(generator.next().value).toEqual(takeLatest(setSubscriptionId.type, setSubscriptionIdInStorageSaga));
            expect(generator.next().done).toBe(true);
        });
    });

    describe('setSubscriptionIdSaga', () => {
        let setSubscriptionIdSagaGenerator;

        it('should call setSubscriptionId action', () => {
            setSubscriptionIdSagaGenerator = setSubscriptionIdSaga();
            setSubscriptionIdSagaGenerator.next();
            setSubscriptionIdSagaGenerator.next(SALESCHANNEL_CONSUMER);
            const putDescriptor = setSubscriptionIdSagaGenerator.next(RED_M_VIRTUAL_ID).value;

            expect(putDescriptor).toEqual(put(setSubscriptionId(RED_M_VIRTUAL_ID, true, false)));
            expect(setSubscriptionIdSagaGenerator.next().done).toBe(true);
        });
    });

    describe('setSubscriptionIdInStorageSaga', () => {
        let setSubscriptionIdInStorageSagaGenerator;

        it('should set subscriptionId in storage when updateStorage flag is true', () => {
            setSubscriptionIdInStorageSagaGenerator = setSubscriptionIdInStorageSaga({ payload: { subscriptionId: RED_M_VIRTUAL_ID, updateStorage: true, shouldTrackPageView: false } } as Parameters<typeof setSubscriptionIdInStorageSaga>[0]);
            setSubscriptionIdInStorageSagaGenerator.next();
            const putDescriptor = setSubscriptionIdInStorageSagaGenerator.next(SALESCHANNEL_CONSUMER).value;
            const expected = call(updateStorageHelper<SailsVvlStorage>, SAILS_VVL_STORAGE, {
                [SAILS_PARAM_SUB_ID]: {
                    [SALESCHANNEL_CONSUMER]: RED_M_VIRTUAL_ID,
                },
            } as Partial<SailsVvlStorage>, null, { shouldDeepMerge: true });

            expect(putDescriptor).toEqual(expected);

            setSubscriptionIdInStorageSagaGenerator.next();
            expect(setSubscriptionIdInStorageSagaGenerator.next().done).toBe(true);
        });

        it('should call trackPageView function', () => {
            setSubscriptionIdInStorageSagaGenerator = setSubscriptionIdInStorageSaga({ payload: { subscriptionId: RED_M_VIRTUAL_ID, updateStorage: false, shouldTrackPageView: true } } as Parameters<typeof setSubscriptionIdInStorageSaga>[0]);
            setSubscriptionIdInStorageSagaGenerator.next();
            setSubscriptionIdInStorageSagaGenerator.next();
            setSubscriptionIdInStorageSagaGenerator.next(SALESCHANNEL_CONSUMER);
            expect(setSubscriptionIdInStorageSagaGenerator.next().value)
                .toEqual(put(addTrackingToAction(trackPageView(), TrackType.PageView, expect.anything())));

            expect(setSubscriptionIdInStorageSagaGenerator.next().done).toBe(true);
        });

        it('Should update tariff query param', () => {
            const { location } = window;
            delete (window as any).location;
            (window as any).location = new URL(`https://www.example.com?${URL_PARAM_SUBGROUP_ID}=123`);
            const subscriptionId = RED_M_VIRTUAL_ID;

            setSubscriptionIdInStorageSagaGenerator = setSubscriptionIdInStorageSaga({ payload: { subscriptionId, updateStorage: false, shouldTrackPageView: false } } as Parameters<typeof setSubscriptionIdInStorageSaga>[0]);
            setSubscriptionIdInStorageSagaGenerator.next(SALESCHANNEL_CONSUMER);

            expect(setSubscriptionIdInStorageSagaGenerator.next(subscriptionId).value).toEqual(call(updateUrl, `https://www.example.com/?${URL_PARAM_SUBGROUP_ID}=${subscriptionId}`, true));
            setSubscriptionIdInStorageSagaGenerator.next();
            const done = setSubscriptionIdInStorageSagaGenerator.next().done;
            expect(done).toBeTruthy();

            window.location = location;
        });
    });

    describe('getSubscriptionSaga', () => {
        let generator: Generator<StrictEffect>;

        beforeEach(() => {
            generator = getSubscriptionsSaga();
            generator.next();
        });

        it('should call the tariff service', () => {
            const tariffService = GladosServiceFactory.getTariffService();

            generator.next(['123', SALESCHANNEL_CONSUMER, [{ hardwareId: '1234' }, { hardwareId: '5678' }], GIGAKOMBI_TV, true, 1]);

            expect(generator.next([
                1, 2, 3,
            ]).value).toEqual(call([tariffService, tariffService.getTariffWithHardware], 'v1', expect.objectContaining({
                btx: API_BTX_VVL,
                salesChannel: [API_SALESCHANNEL_CONSUMER],
                discountIds: ['1', '2'],
                tariffIds: [1, 2, 3],
                atomicIds: ['1234', '5678'],
            })));
            const fixture = {
                data: [{
                    hardware: {},
                    tariffs: [
                        {},
                    ],
                }],
            };
            expect(generator.next({ data: fixture }).value).toEqual(put(getSubscriptionsSuccess(fixture as TariffWithHardwareResponse<RedTariff | YoungTariff>)));
        });

        it('should dispatch failure action on error', () => {
            generator.next(['123', SALESCHANNEL_CONSUMER, [{ hardwareId: '1234' }, { hardwareId: '5678' }], GIGAKOMBI_TV, true, 1]);
            generator.next([1, 2, 3]);

            const fixture = new Error('foo');

            expect(generator.throw(fixture).value).toEqual(call([console, 'error'], fixture));
            expect(generator.next().value).toEqual(put(getSubscriptionsFailed()));
            expect(generator.next().done).toBe(true);
        });
    });
});
