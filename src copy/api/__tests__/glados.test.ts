import {
    SerializedError,
    configureStore,
} from '@reduxjs/toolkit';
import {
    getHardwareDetailGroup,
    getTariffWithHardware,
    gladosApi,
} from '../glados';
import {
    API_BTX_VVL,
    MAP_SALESCHANNEL_TO_API_SALESCHANNEL,
    RED_L_VIRTUAL_ID,
    RED_M_VIRTUAL_ID,
    RED_S_VIRTUAL_ID,
    RED_XL_VIRTUAL_ID,
    RED_XS_VIRTUAL_ID,
    SALESCHANNEL_CONSUMER,
} from '@vfde-sails/constants';
import {
    AttributeGroup,
    HardwareDetailGroupAtomic,
} from '@vfde-sails/glados-v2';
import * as appSelectors from '../../features/App/selectors';
import * as optionsSelectors from '../../features/Options/selectors';

// names must start with 'mock' so jest allows it to be a constant

const mockGetDevice = jest.fn();
const mockGetSubscriptions = jest.fn();

jest.mock('@vfde-sails/glados-v2', () => ({
    ...jest.requireActual('@vfde-sails/glados-v2'),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    GladosServiceFactory: {
        getHardwareService: jest.fn().mockImplementation(() => ({
            getHardwareDetailGroup: mockGetDevice,
            setMocking: jest.fn(),
        })),
        getTariffService: jest.fn().mockImplementation(() => ({
            getTariffWithHardware: mockGetSubscriptions,
            setMocking: jest.fn(),
        })),
    },
}));

jest.mock('@vfde-brix/ws10/option-picker', () => ({
    /* eslint-disable @typescript-eslint/naming-convention */
    OPTION_PICKER_INPUT_CLASSNAME: 'foo',
    /* eslint-enable @typescript-eslint/naming-convention */
}));

jest.mock('@vfde-sails/page-options', () => ({
    /* eslint-disable @typescript-eslint/naming-convention */
    getAllDiscounts: jest.fn(),
    /* eslint-enable @typescript-eslint/naming-convention */
}));

const mockSubscriptionIds = [RED_XS_VIRTUAL_ID, RED_S_VIRTUAL_ID, RED_M_VIRTUAL_ID, RED_L_VIRTUAL_ID, RED_XL_VIRTUAL_ID];
jest.mock('../../helpers/tariffOptionPickerHelpers', () => ({
    ...jest.requireActual('../../helpers/tariffOptionPickerHelpers'), // Preserve actual implementation
    __esModule: true,
    getSubscriptionIdsFromCms: jest.fn().mockImplementation(() => mockSubscriptionIds),
}));

jest.mock('../../helpers/tariffOptionPickerHelpers', () => ({
    getSubscriptionIdsFromCms: jest.fn().mockImplementation(() => mockSubscriptionIds),
}));

const createStoreForTest = () => configureStore({
    reducer: {
        [gladosApi.reducerPath]: gladosApi.reducer,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(gladosApi.middleware),
});

describe('Glados API', () => {
    let store: ReturnType<typeof createStoreForTest>;

    beforeEach(() => {
        store = createStoreForTest();
        jest.spyOn(appSelectors, 'selectDeviceId').mockReturnValue('10');
        jest.spyOn(appSelectors, 'selectIsGigakombiEligible').mockReturnValue(true);
        jest.spyOn(appSelectors, 'selectGigakombiType').mockReturnValue(null);
        jest.spyOn(appSelectors, 'selectIsTauschbonus').mockReturnValue(false);
    });

    describe('getHardwareDetailGroup', () => {
        test('success case', async () => {
            const responseData = { data: { data: {} } };
            mockGetDevice.mockResolvedValue(responseData);

            const resultAction = await store.dispatch(getHardwareDetailGroup.initiate({ salesChannel: SALESCHANNEL_CONSUMER }));

            expect(resultAction.status).toBe('fulfilled');
            expect(resultAction.isSuccess).toBe(true);
            expect(resultAction.data).toEqual(responseData.data);
        });

        test('error case', async () => {
            (mockGetDevice).mockRejectedValue(new Error('foo'));
            const resultAction = await store.dispatch(getHardwareDetailGroup.initiate({ salesChannel: SALESCHANNEL_CONSUMER }));
            expect(resultAction.status).toBe('rejected');
            expect(mockGetDevice).toHaveBeenCalled();
            expect(resultAction.isSuccess).toBe(false);
            expect((resultAction.error as SerializedError).message).toBe('foo');
        });
    });

    describe('getTariffWithHardware', () => {
        test('success case (with subscriptionId)', async () => {
            const atomic = {
                hardwareId: 'foo',
                attributeGroups: 'atomicAttributeGroups' as unknown as AttributeGroup[],
            } as HardwareDetailGroupAtomic;
            jest.spyOn(optionsSelectors, 'selectAtomicDevices').mockReturnValue([atomic]);

            const params = {
                btx: API_BTX_VVL,
                salesChannel: [MAP_SALESCHANNEL_TO_API_SALESCHANNEL[SALESCHANNEL_CONSUMER]],
                discountIds: undefined,
                tariffIds: ['133',
                    '134',
                    '135',
                    '136',
                    '137'],
                atomicIds: ['foo'],
            };

            const responseData = { data: { data: {} } };
            (mockGetSubscriptions).mockReturnValue(responseData);
            const resultAction = await store.dispatch(getTariffWithHardware.initiate({ salesChannel: SALESCHANNEL_CONSUMER, isTradeIn: false }));
            expect(mockGetSubscriptions).toHaveBeenCalledWith('v1', params);
            expect(resultAction.status).toBe('fulfilled');
            expect(resultAction.isSuccess).toBe(true);
            expect(resultAction.data).toEqual(responseData.data);
        });

        test('error case (without subscriptionId)', async () => {

            (mockGetSubscriptions).mockRejectedValue(new Error('foo'));
            const resultAction = await store.dispatch(getTariffWithHardware.initiate({ salesChannel: SALESCHANNEL_CONSUMER, isTradeIn: false }));
            expect(mockGetSubscriptions).toHaveBeenCalled();
            expect(resultAction.status).toBe('rejected');
            expect(resultAction.isSuccess).toBe(false);
            expect((resultAction.error as SerializedError).message).toBe('foo');
        });
    });
});
