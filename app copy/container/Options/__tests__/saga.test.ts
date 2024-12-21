import {
    call,
    put,
    select,
    StrictEffect,
    takeLatest,
} from 'redux-saga/effects';
import { redirectToDop } from '../../../helpers/redirectToHelper';
import optionsSaga, {
    changeCapacitySaga,
    changeColorSaga,
    getDeviceSaga,
    getDeviceSuccessSaga,
    initSaga,
    setAtomicIdSaga,
} from '../saga';
import {
    ADDITIONAL_PAGE_OPTIONS,
    API_BTX_VVL,
    API_SALESCHANNEL_CONSUMER,
    RED_L_VIRTUAL_ID,
    RED_M_VIRTUAL_ID,
    RED_S_VIRTUAL_ID,
    RED_XL_VIRTUAL_ID,
    RED_XS_VIRTUAL_ID,
    SAILS_PARAM_ATOMIC_ID,
    SAILS_VVL_STORAGE,
    SALESCHANNEL_CONSUMER,
    YOUNG_L_VIRTUAL_ID,
    YOUNG_M_VIRTUAL_ID,
    YOUNG_S_VIRTUAL_ID,
    YOUNG_XL_VIRTUAL_ID,
    YOUNG_XS_VIRTUAL_ID,
} from '@vfde-sails/constants';
import {
    SailsVvlStorage,
    updateStorage,
} from '@vfde-sails/storage';
import {
    Capacity,
    Color,
    GladosServiceFactory,
    HardwareAtomic,
    HardwareDetailGroupResponse,
} from '@vfde-sails/glados-v2';
import {
    changeCapacity,
    changeColor,
    getDevice,
    getDeviceFailed,
    getDeviceSuccess,
    setAtomicId,
    setDefaultState,
} from '../slice';
import { getSubscriptions } from '../../Tariff/slice';
import { selectActiveOffer } from 'Container/Tariff/selectors';

jest.mock('../../../helpers/redirectToHelper', () => ({
    redirectToDop: jest.fn(),
    redirectToMtanPage: jest.fn(),
}));

jest.mock('@vfde-sails/utils', () => ({
    ...jest.requireActual('@vfde-sails/utils'),
    __esModule: true,
    getApiCredentials: jest.fn().mockImplementation(() => ({
        key: 'someApiKey',
        url: 'someApiUrl',
    })),
}));

const mockSubscriptionIds = [RED_XS_VIRTUAL_ID, RED_S_VIRTUAL_ID, RED_M_VIRTUAL_ID, RED_L_VIRTUAL_ID, RED_XL_VIRTUAL_ID];
jest.mock('Helper/tariffOptionPickerHelpers', () => ({
    ...jest.requireActual('Helper/tariffOptionPickerHelpers'), // Preserve actual implementation
    __esModule: true,
    getSubscriptionIdsFromCms: jest.fn().mockImplementation(() => mockSubscriptionIds),
}));

jest.mock('@vfde-sails/page-options', () => ({
    ...jest.requireActual('@vfde-sails/page-options'),
    __esModule: true,
    getDeviceDiscountSoc: jest.fn().mockImplementation(() => []),
    getDefaultDiscountSocs: jest.fn().mockImplementation(() => []),
}));

jest.mock('@vfde-brix/ws10/styles', () => ({
}));

jest.mock('@vfde-brix/ws10/option-picker', () => ({
}));

jest.mock('@vfde-brix/ws10/offer-summary-card', () => ({
}));

jest.mock('@vfde-brix/ws10/unordered-horizontal-list', () => ({
}));

jest.mock('@vfde-brix/ws10/core', () => ({
}));

jest.mock('@vfde-brix/ws10/overlay', () => ({
}));

jest.mock('@vfde-brix/ws10/accordion', () => ({
}));

jest.mock('@vfde-brix/ws10/table', () => ({
}));

jest.mock('@vfde-brix/ws10/promotional-card', () => ({
}));

jest.mock('@vfde-brix/ws10/image-gallery', () => ({
}));

jest.mock('@vfde-brix/ws10/icon-text', () => ({
}));

jest.mock('@vfde-brix/ws10/text-header', () => ({
}));

jest.mock('@vfde-brix/ws10/promo-price', () => ({
}));

describe('Options sagas', () => {

    describe('optionsSaga generator function', () => {
        const optionsGenerator = optionsSaga();

        it('should start watch tasks in the correct order', () => {
            expect(optionsGenerator.next().value).toEqual(takeLatest(setDefaultState.type, initSaga));
            expect(optionsGenerator.next().value).toEqual(takeLatest(getDevice.type, getDeviceSaga));
            expect(optionsGenerator.next().value).toEqual(takeLatest(getDeviceSuccess.type, getDeviceSuccessSaga));
            expect(optionsGenerator.next().value).toEqual(takeLatest(changeColor.type, changeColorSaga));
            expect(optionsGenerator.next().value).toEqual(takeLatest(changeCapacity.type, changeCapacitySaga));
            expect(optionsGenerator.next().value).toEqual(takeLatest(setAtomicId.type, setAtomicIdSaga));
            expect(optionsGenerator.next().done).toBe(true);
        });
    });

    describe('initSaga', () => {
        let generator: Generator<StrictEffect>;

        beforeEach(() => {
            generator = initSaga();
            generator.next();
        });

        it('should call redirectToDop if deviceId is falsy', () => {
            expect(generator.next([null]).value).toEqual(call(redirectToDop));
            expect(generator.next().done).toBe(true);
        });

        it('should call getDevice if deviceId is truthy', () => {
            expect(generator.next(['deviceId']).value).toEqual(put(getDevice()));
            expect(generator.next().done).toBe(true);
        });
    });

    describe('getDeviceSaga', () => {
        let generator: Generator<StrictEffect>;

        beforeEach(() => {
            generator = getDeviceSaga();
            generator.next();
        });

        (window as any)[ADDITIONAL_PAGE_OPTIONS] = {
            optionPicker: {
                defaultSubscriptionIds: {
                    gigaMobil: RED_M_VIRTUAL_ID,
                    gigaMobilYoung: YOUNG_M_VIRTUAL_ID,
                },
                subscriptionIds: {
                    consumer: [
                        RED_XS_VIRTUAL_ID,
                        RED_S_VIRTUAL_ID,
                        RED_M_VIRTUAL_ID,
                        RED_L_VIRTUAL_ID,
                        RED_XL_VIRTUAL_ID,
                    ],
                    young: [
                        YOUNG_XS_VIRTUAL_ID,
                        YOUNG_S_VIRTUAL_ID,
                        YOUNG_M_VIRTUAL_ID,
                        YOUNG_L_VIRTUAL_ID,
                        YOUNG_XL_VIRTUAL_ID,
                    ],
                    default: {
                        consumer: RED_M_VIRTUAL_ID,
                        young: YOUNG_M_VIRTUAL_ID,
                    },
                },
            },
        };

        describe('should call the hardware service', () => {
            const hardwareService = GladosServiceFactory.getHardwareService();

            it('default case', () => {
                expect(generator.next(
                    [SALESCHANNEL_CONSUMER, '123'],
                ).value).toEqual(call([hardwareService, hardwareService.getHardwareDetailGroup], 'v1', expect.objectContaining({
                    salesChannel: [API_SALESCHANNEL_CONSUMER],
                    btx: API_BTX_VVL,
                    tariffIds: mockSubscriptionIds,
                    discountIds: [],
                    groupId: '123',
                })));
                expect(generator.next({
                    data: { data: {} },
                }).value).toEqual(put(getDeviceSuccess({ data: {} } as HardwareDetailGroupResponse)));

                expect(generator.next().done).toBe(true);
            });
        });

        it('should redirect to DOP on error with status code 404', () => {
            generator.next([SALESCHANNEL_CONSUMER, '123']);
            const error: any = new Error('foo');
            error.response = {
                status: 404,
            };

            expect(generator.throw(error).value).toEqual(call([console, 'error'], error));
            expect(generator.next().value).toEqual(call(redirectToDop));
            expect(generator.next().done).toBe(true);
        });

        it('should dispatch failure action on error', () => {
            generator.next([SALESCHANNEL_CONSUMER, '123']);
            const error = new Error('foo');
            expect(generator.throw(error).value).toEqual(call([console, 'error'], error));
            expect(generator.next().value).toEqual(put(getDeviceFailed()));
            expect(generator.next().done).toBe(true);
        });
    });

    describe('getDevicesSuccessSaga', () => {
        it('should call trackPageView function', () => {
            const getDeviceSuccessSagaGenerator = getDeviceSuccessSaga();
            const atomicId = '1234';
            getDeviceSuccessSagaGenerator.next();
            expect(getDeviceSuccessSagaGenerator.next(atomicId).value).toEqual(put(setAtomicId(atomicId)));
            expect(getDeviceSuccessSagaGenerator.next().value).toEqual(put(getSubscriptions()));
            expect(getDeviceSuccessSagaGenerator.next().done).toBe(true);
        });
    });

    describe('changeColorSaga', () => {
        let generator: Generator<StrictEffect>;

        beforeEach(() => {
            generator = changeColorSaga();
            generator.next();
        });

        it('should dispatch setAtomicId action', () => {
            expect(generator.next([
                {
                    displayLabel: 'bar',
                    sortValue: 123,
                } as Capacity,
                [
                    { displayLabel: 'bar', sortValue: 123 },
                    { displayLabel: 'foobar', sortValue: 45 },
                ] as Capacity[],
            ]).value).toEqual(put(changeCapacity(123)));
        });
    });

    describe('changeCapacitySaga', () => {
        let generator: Generator<StrictEffect>;

        beforeEach(() => {
            generator = changeCapacitySaga();
            generator.next();
        });

        it('should dispatch setAtomicId action', () => {
            expect(generator.next([
                {
                    displayLabel: 'foo',
                } as Color,
                {
                    displayLabel: 'bar',
                    sortValue: 123,
                } as Capacity,
                [
                    {
                        color: {
                            displayLabel: 'bar',
                        },
                        capacity: {
                            displayLabel: 'bar',
                            sortValue: 123,
                        },
                        hardwareId: '456',
                    },
                    {
                        color: {
                            displayLabel: 'foo',
                        },
                        capacity: {
                            displayLabel: 'foobar',
                            sortValue: 456,
                        },
                        hardwareId: '789',
                    },
                    {
                        color: {
                            displayLabel: 'foo',
                        },
                        capacity: {
                            displayLabel: 'bar',
                            sortValue: 123,
                        },
                        hardwareId: '123',
                    },
                ] as HardwareAtomic[],
            ]).value).toEqual(put(setAtomicId('123')));
        });
    });

    describe('setAtomicIdSaga', () => {
        const action = {
            payload: {
                atomicId: '1234',
            },
        };

        let setAtomicIdSagaGenerator;

        it('should update atomic Id in storage', () => {
            setAtomicIdSagaGenerator = setAtomicIdSaga( action as Parameters<typeof setAtomicIdSaga>[0]);
            const expected = call(updateStorage<SailsVvlStorage>, SAILS_VVL_STORAGE, {
                [SAILS_PARAM_ATOMIC_ID]: action.payload.atomicId,
            }, null, { shouldDeepMerge: true });

            expect(setAtomicIdSagaGenerator.next().value).toEqual(expected);
        });

        it('should call createTrackingData function', () => {
            setAtomicIdSagaGenerator = setAtomicIdSaga(action as Parameters<typeof setAtomicIdSaga>[0]);
            setAtomicIdSagaGenerator.next();
            setAtomicIdSagaGenerator.next();

            expect(setAtomicIdSagaGenerator.next().done).toBe(true);
        });

        it('should not call createTrackingData function', () => {
            setAtomicIdSagaGenerator = setAtomicIdSaga(action as Parameters<typeof setAtomicIdSaga>[0]);
            setAtomicIdSagaGenerator.next();
            expect(setAtomicIdSagaGenerator.next().value.toString()).toBe((select(selectActiveOffer())).toString());
            expect(setAtomicIdSagaGenerator.next(null).value).toBe(undefined);
            expect(setAtomicIdSagaGenerator.next()).toEqual({ done: true });
        });
    });
});
