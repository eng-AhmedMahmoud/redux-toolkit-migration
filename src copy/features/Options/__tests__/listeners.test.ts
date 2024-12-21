import { UnsubscribeListener } from '@reduxjs/toolkit';
import { listener } from '../../../app/listener';
import {
    listeners,
    startListeners,
} from '../listeners';
import * as deviceSelectors from '../selectors';
import * as appSelectors from '../../App/selectors';
import * as tariffSelectors from '../../Tariff/selectors';
import {
    Cellular,
    HardwareDetailGroupAtomic,
    HardwareDetailGroupResponse,
    TariffWithHardwareOffer,
} from '@vfde-sails/glados-v2';
import {
    getHardwareDetailGroup,
    gladosApi,
} from '../../../api/glados';
import {
    setDefaultState,
    changeColor,
    changeCapacity,
    setAtomicId,
    toggleAccordionItem,
    setDevicePayload,
} from '../slice';
import {
    SAILS_PARAM_ATOMIC_ID,
    SAILS_VVL_STORAGE,
    SALESCHANNEL_CONSUMER,
    SALESCHANNEL_YOUNG,
} from '@vfde-sails/constants';
import { redirectToDop } from '../../../helpers/redirectToHelper';

import {
    TRACKING_INFORMATION_ACTION_REVEAL,
    TrackingInformationTrigger,
    TrackingInformationUiType,
    trackIt,
    TrackType,
} from '@vfde-sails/tracking';
import { updateStorage as updateStorageHelper } from '@vfde-sails/storage';
import { decodeHtml } from '@vfde-sails/utils';
import { createTrackingData } from '../../App/helpers/tracking';

jest.mock('@vfde-sails/storage', () => ({
    ...jest.requireActual('@vfde-sails/storage'),
    updateStorage: jest.fn(),
    getSessionStorageItemJson: jest.fn().mockReturnValue({ atomicId: 'atomic123' }),
}));
jest.mock('@vfde-sails/utils', () => ({
    decodeHtml: jest.fn(),
}));

jest.mock('@vfde-sails/tracking', () => ({
    trackIt: jest.fn(),
    TRACKING_INFORMATION_ACTION_REVEAL: 'reveal',
    TrackingInformationTrigger: {
        Accordion: 'accordion',
        Tab: 'tab',
        Anchor: 'anchor',
    },
    TrackingInformationUiType: {
        Faq: 'faq',
        Panel: 'panel',
        Accordion: 'accordion',
        Overlay: 'layover',
    },
    TrackType: {
        PageView: 'pageview',
        Information: 'information',
        FilterProducts: 'filter products',
        SwitchOptions: 'switch options',
        Overlay: 'layover',
        Error: 'error',
    },
}));

jest.mock('../../App/slice', () => ({
    trackPageView: jest.fn(),
}));

// jest.mock('../slice');

jest.mock('../../App/helpers/tracking', () => ({
    createTrackingData: jest.fn(),
}));

jest.mock('../helpers/capacityHelper', () => ({
    getNewSelectedCapacity: jest.fn(),
}));

jest.mock('../selectors.ts');
jest.mock('../../App/selectors.ts');
jest.mock('../../Tariff/selectors.ts');

jest.mock('../../../helpers/redirectToHelper', () => ({
    ...jest.requireActual('../../../helpers/redirectToHelper.ts'),
    redirectToDop: jest.fn(),
}));

describe('Device listeners', () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('startListeners', () => {
        expect(() => {
            startListeners()();
        }).not.toThrow();
    });

    describe('setDefaultState listener', () => {
        let unsubscribe: UnsubscribeListener;

        beforeAll(() => {
            unsubscribe = listeners.setDefaultState();
        });

        afterAll(() => {
            unsubscribe();
        });

        it('should dispatch getHardwareDetailGroup.initiate if deviceId exists', () => {
            jest.spyOn(appSelectors, 'selectDeviceId').mockReturnValue('123');

            const dispatchMock = jest.fn();
            const getStateMock = jest.fn();
            const mockState = {};

            listener.middleware({
                dispatch: dispatchMock,
                getState: getStateMock.mockReturnValue(mockState),
            })(() => (action: any) => action)(setDefaultState('123'));

            expect(dispatchMock).toHaveBeenCalledWith(expect.any(Function));
        });

        it('should call redirectToDop if deviceId does not exist', () => {
            jest.spyOn(appSelectors, 'selectDeviceId').mockReturnValue(null);

            const dispatchMock = jest.fn();
            const getStateMock = jest.fn();
            const mockState = {};

            listener.middleware({
                dispatch: dispatchMock,
                getState: getStateMock.mockReturnValue(mockState),
            })(() => (action: any) => action)(setDefaultState('123'));

            expect(redirectToDop).toHaveBeenCalled();
        });
    });

    describe('getDeviceFulfilled listener', () => {
        let unsubscribe: UnsubscribeListener;

        beforeAll(() => {
            unsubscribe = listeners.getDeviceFulfilled();
        });

        afterAll(() => {
            unsubscribe();
        });

        it('should dispatch setAtomicId, setDevicePayload and initiate getTariffWithHardware', () => {
            // Mock selectors
            jest.spyOn(deviceSelectors, 'selectAtomicId').mockReturnValue('atomic123');
            jest.spyOn(appSelectors, 'selectSalesChannel').mockReturnValue(SALESCHANNEL_CONSUMER);
            jest.spyOn(appSelectors, 'selectIsTradeIn').mockReturnValue(false);

            const mockDevicePayload: HardwareDetailGroupResponse = {
                data: {
                    modelName: 'Test Phone',
                    virtualItemId: 'test-id',
                    legacyGroupId: 'legacy-id',
                    promotionAttribute: { cellular: Cellular.FiveG },
                    url: { hubpage: { href: 'test-url' }, galleryImage: { href: 'test-image' } },
                    colors: [],
                    capacities: [],
                    atomics: [],
                    attributeGroups: [],
                },
            };

            const dispatchMock = jest.fn();
            const getStateMock = jest.fn();
            const mockState = {};

            listener.middleware({
                dispatch: dispatchMock,
                getState: getStateMock.mockReturnValue(mockState),
            })(() => (action: any) => action)({
                type: `${gladosApi.reducerPath}/executeQuery/fulfilled`,
                payload: mockDevicePayload,
                meta: {
                    arg: {
                        endpointName: getHardwareDetailGroup.name,
                    },
                },
            });

            expect(dispatchMock).toHaveBeenCalledWith(setAtomicId('atomic123'));
            expect(dispatchMock).toHaveBeenCalledWith(setDevicePayload(mockDevicePayload));
            expect(dispatchMock).toHaveBeenCalledWith(expect.any(Function));
        });

        it('should handle different salesChannel and tradeIn values', () => {
            // Mock selectors with different values
            jest.spyOn(deviceSelectors, 'selectAtomicId').mockReturnValue('atomic456');
            jest.spyOn(appSelectors, 'selectSalesChannel').mockReturnValue(SALESCHANNEL_YOUNG);
            jest.spyOn(appSelectors, 'selectIsTradeIn').mockReturnValue(true);

            const mockDevicePayload: HardwareDetailGroupResponse = {
                data: {
                    modelName: 'Test Phone2',
                    virtualItemId: 'test-id',
                    legacyGroupId: 'legacy-id',
                    promotionAttribute: { cellular: Cellular.FiveG },
                    url: { hubpage: { href: 'test-url' }, galleryImage: { href: 'test-image' } },
                    colors: [],
                    capacities: [],
                    atomics: [],
                    attributeGroups: [],
                },
            };

            const dispatchMock = jest.fn();
            const getStateMock = jest.fn();
            const mockState = {};

            listener.middleware({
                dispatch: dispatchMock,
                getState: getStateMock.mockReturnValue(mockState),
            })(() => (action: any) => action)({
                type: `${gladosApi.reducerPath}/executeQuery/fulfilled`,
                payload: mockDevicePayload,
                meta: {
                    arg: {
                        endpointName: getHardwareDetailGroup.name,
                    },
                },
            });

            expect(dispatchMock).toHaveBeenCalledWith(setAtomicId('atomic456'));
            expect(dispatchMock).toHaveBeenCalledWith(setDevicePayload(mockDevicePayload));
            expect(dispatchMock).toHaveBeenCalledWith(expect.any(Function));
        });
    });

    // describe('getDeviceFulfilled listener', () => {
    //     let unsubscribe: UnsubscribeListener;

    //     beforeAll(() => {
    //         unsubscribe = listeners.getDeviceFulfilled();
    //     });

    //     afterAll(() => {
    //         unsubscribe();
    //     });

    //     it('should dispatch setAtomicId, setDevicePayload and initiate getTariffWithHardware', () => {
    //         jest.spyOn(deviceSelectors, 'selectAtomicId').mockReturnValue('atomic123');
    //         jest.spyOn(appSelectors, 'selectSalesChannel').mockReturnValue(SALESCHANNEL_CONSUMER);
    //         jest.spyOn(appSelectors, 'selectIsTradeIn').mockReturnValue(false);

    //         const mockDevicePayload: HardwareDetailGroupResponse = {
    //             data: {
    //                 modelName: 'Test Phone',
    //                 virtualItemId: 'test-id',
    //                 legacyGroupId: 'legacy-id',
    //                 promotionAttribute: { cellular: Cellular.FiveG },
    //                 url: { hubpage: { href: 'test-url' }, galleryImage: { href: 'test-image' } },
    //                 colors: [],
    //                 capacities: [],
    //                 atomics: [],
    //                 attributeGroups: [],
    //             },
    //         };

    //         const dispatchMock = jest.fn();
    //         const getStateMock = jest.fn();
    //         const mockState = {};

    //         listener.middleware({
    //             dispatch: dispatchMock,
    //             getState: getStateMock.mockReturnValue(mockState),
    //         })(() => (action: any) => action)({
    //             type: `${gladosApi.reducerPath}/executeQuery/fulfilled`,
    //             payload: mockDevicePayload,
    //             meta: {
    //                 arg: {
    //                     endpointName: getHardwareDetailGroup.name,
    //                 },
    //             },
    //         });

    //         expect(dispatchMock).toHaveBeenCalledWith({ type: 'vvlDeviceDetailsOptions/setAtomicId', payload: 'atomic123' });
    //         expect(dispatchMock).toHaveBeenCalledWith({ type: 'vvlDeviceDetailsOptions/setDevicePayload', payload: mockDevicePayload });
    //         expect(dispatchMock).toHaveBeenCalledWith({
    //             type: 'getTariffWithHardware/initiate',
    //             payload: {
    //                 salesChannel: SALESCHANNEL_CONSUMER,
    //                 isTradeIn: false,
    //             },
    //         });
    //     });

    //     it('should handle different salesChannel and tradeIn values', () => {
    //         jest.spyOn(deviceSelectors, 'selectAtomicId').mockReturnValue('atomic456');
    //         jest.spyOn(appSelectors, 'selectSalesChannel').mockReturnValue(SALESCHANNEL_YOUNG);
    //         jest.spyOn(appSelectors, 'selectIsTradeIn').mockReturnValue(true);

    //         const mockDevicePayload: HardwareDetailGroupResponse = {
    //             data: {
    //                 modelName: 'Test Phone2',
    //                 virtualItemId: 'test-id',
    //                 legacyGroupId: 'legacy-id',
    //                 promotionAttribute: { cellular: Cellular.FiveG },
    //                 url: { hubpage: { href: 'test-url' }, galleryImage: { href: 'test-image' } },
    //                 colors: [],
    //                 capacities: [],
    //                 atomics: [],
    //                 attributeGroups: [],
    //             },
    //         };

    //         const dispatchMock = jest.fn();
    //         const getStateMock = jest.fn();
    //         const mockState = {};

    //         listener.middleware({
    //             dispatch: dispatchMock,
    //             getState: getStateMock.mockReturnValue(mockState),
    //         })(() => (action: any) => action)({
    //             type: `${gladosApi.reducerPath}/executeQuery/fulfilled`,
    //             payload: mockDevicePayload,
    //             meta: {
    //                 arg: {
    //                     endpointName: getHardwareDetailGroup.name,
    //                 },
    //             },
    //         });

    //         expect(dispatchMock).toHaveBeenCalledWith({ type: 'vvlDeviceDetailsOptions/setAtomicId', payload: 'atomic456' });
    //         expect(dispatchMock).toHaveBeenCalledWith({ type: 'vvlDeviceDetailsOptions/setDevicePayload', payload: mockDevicePayload });
    //         expect(dispatchMock).toHaveBeenCalledWith({
    //             type: 'getTariffWithHardware/initiate',
    //             payload: {
    //                 salesChannel: SALESCHANNEL_YOUNG,
    //                 isTradeIn: true,
    //             },
    //         });
    //     });
    // });

    describe('changeColor listener', () => {
        let unsubscribe: UnsubscribeListener;

        beforeAll(() => {
            unsubscribe = listeners.changeColor();
        });

        afterAll(() => {
            unsubscribe();
        });

        it('should dispatch changeCapacity with new capacity', () => {
            jest.spyOn(deviceSelectors, 'selectCurrentCapacity').mockReturnValue({ displayLabel: '64GB', sortValue: 64 });
            jest.spyOn(deviceSelectors, 'selectCapacitiesForColor').mockReturnValue([
                { displayLabel: '64GB', sortValue: 64 },
                { displayLabel: '128GB', sortValue: 128 },
            ]);
            const getNewSelectedCapacityMock = jest.requireMock('../helpers/capacityHelper').getNewSelectedCapacity;
            getNewSelectedCapacityMock.mockReturnValue({ sortValue: 128 });

            const dispatchMock = jest.fn();
            const getStateMock = jest.fn();
            const mockState = {};

            listener.middleware({
                dispatch: dispatchMock,
                getState: getStateMock.mockReturnValue(mockState),
            })(() => (action: any) => action)(changeColor('red'));

            expect(dispatchMock).toHaveBeenCalledWith(changeCapacity(128));
        });
    });

    describe('changeCapacity listener', () => {
        let unsubscribe: UnsubscribeListener;

        beforeAll(() => {
            unsubscribe = listeners.changeCapacity();
        });

        afterAll(() => {
            unsubscribe();
        });

        it('should dispatch setAtomicId with new atomic device', () => {
            jest.spyOn(deviceSelectors, 'selectCurrentColor').mockReturnValue({
                displayLabel: 'red',
                primaryColorRgb: '255,0,0',
            });
            jest.spyOn(deviceSelectors, 'selectCurrentCapacity').mockReturnValue({ displayLabel: '64GB', sortValue: 64 });
            jest.spyOn(deviceSelectors, 'selectAtomicDevices').mockReturnValue([
                {
                    hardwareId: 'atomic123',
                    defaultAtomicDevice: true,
                    color: {
                        displayLabel: 'red',
                        primaryColorRgb: '255,0,0',
                    },
                    capacity: {
                        sortValue: 64,
                        displayLabel: '64GB',
                    },
                },
                {
                    hardwareId: 'foo2',
                    defaultAtomicDevice: false,
                    color: {
                        displayLabel: 'green',
                        primaryColorRgb: '0,255,0',
                    },
                    capacity: {
                        sortValue: 128,
                        displayLabel: '128GB',
                    },
                },
            ] as HardwareDetailGroupAtomic[]);

            const dispatchMock = jest.fn();
            const getStateMock = jest.fn();
            const mockState = {};

            listener.middleware({
                dispatch: dispatchMock,
                getState: getStateMock.mockReturnValue(mockState),
            })(() => (action: any) => action)(changeCapacity(64));

            expect(dispatchMock).toHaveBeenCalledWith(setAtomicId('atomic123'));
        });
    });

    describe('setAtomicId listener', () => {
        let unsubscribe: UnsubscribeListener;

        beforeEach(() => {
            jest.clearAllMocks();
            unsubscribe = listeners.setAtomicId();
        });

        afterAll(() => {
            unsubscribe();
        });

        it('should update storage and track pageview when activeOffer exists', () => {
            const activeOffer = { virtualItemId: '137' } as TariffWithHardwareOffer;
            const mockState = { someState: 'value' };

            (tariffSelectors.selectActiveOffer as unknown as jest.Mock).mockReturnValue(activeOffer);
            (deviceSelectors.selectAtomicId as unknown as jest.Mock).mockReturnValue('atomic123');
            (appSelectors.selectTrackingPayload as unknown as jest.Mock).mockReturnValue({
                salesChannel: null,
                subscriptionId: null,
                activeOffer: null,
                atomicDevice: null,
                priceToPay: null,
            });
            (createTrackingData as jest.Mock).mockReturnValue({ pageView: 'data' });
            (createTrackingData as jest.Mock).mockReturnValue({ tracking: 'data' });

            const dispatchMock = jest.fn();
            const getStateMock = jest.fn().mockReturnValue(mockState);

            listener.middleware({
                dispatch: dispatchMock,
                getState: getStateMock,
            })(() => (action: any) => action)(setAtomicId('atomic123'));

            expect(updateStorageHelper).toHaveBeenCalledWith(
                SAILS_VVL_STORAGE,
                { [SAILS_PARAM_ATOMIC_ID]: 'atomic123' },
                { atomicId: 'atomic123' },
                { shouldDeepMerge: true },
            );

            expect(tariffSelectors.selectActiveOffer).toHaveBeenCalledWith(mockState);
            expect(createTrackingData).toHaveBeenCalledWith(mockState);
        });

        it('should update storage without tracking when activeOffer is null', () => {
            const mockState = { someState: 'value' };

            (tariffSelectors.selectActiveOffer as unknown as jest.Mock).mockReturnValue(null);
            (deviceSelectors.selectAtomicId as unknown as jest.Mock).mockReturnValue('atomic123');

            const dispatchMock = jest.fn();
            const getStateMock = jest.fn().mockReturnValue(mockState);

            listener.middleware({
                dispatch: dispatchMock,
                getState: getStateMock,
            })(() => (action: any) => action)(setAtomicId('atomic123'));

            expect(updateStorageHelper).toHaveBeenCalledWith(
                SAILS_VVL_STORAGE,
                { [SAILS_PARAM_ATOMIC_ID]: 'atomic123' },
                { atomicId: 'atomic123' },
                { shouldDeepMerge: true },
            );

            expect(tariffSelectors.selectActiveOffer).toHaveBeenCalledWith(mockState);
            expect(createTrackingData).not.toHaveBeenCalled();
        });

        it('should update storage without tracking when activeOffer is undefined', () => {
            const mockState = { someState: 'value' };

            (tariffSelectors.selectActiveOffer as unknown as jest.Mock).mockReturnValue(undefined);
            (deviceSelectors.selectAtomicId as unknown as jest.Mock).mockReturnValue('atomic123');

            const dispatchMock = jest.fn();
            const getStateMock = jest.fn().mockReturnValue(mockState);

            listener.middleware({
                dispatch: dispatchMock,
                getState: getStateMock,
            })(() => (action: any) => action)(setAtomicId('atomic123'));

            expect(updateStorageHelper).toHaveBeenCalledWith(
                SAILS_VVL_STORAGE,
                { [SAILS_PARAM_ATOMIC_ID]: 'atomic123' },
                { atomicId: 'atomic123' },
                { shouldDeepMerge: true },
            );

            expect(tariffSelectors.selectActiveOffer).toHaveBeenCalledWith(mockState);
            expect(createTrackingData).not.toHaveBeenCalled();
        });

        it('should handle storage update failure', () => {
            const mockState = { someState: 'value' };

            (updateStorageHelper as jest.Mock).mockImplementation(() => {
                throw new Error('Storage update failed');
            });
            (tariffSelectors.selectActiveOffer as unknown as jest.Mock).mockReturnValue(null);
            (deviceSelectors.selectAtomicId as unknown as jest.Mock).mockReturnValue('atomic123');

            const dispatchMock = jest.fn();
            const getStateMock = jest.fn().mockReturnValue(mockState);

            listener.middleware({
                dispatch: dispatchMock,
                getState: getStateMock,
            })(() => (action: any) => action)(setAtomicId('atomic123'));

            expect(updateStorageHelper).toHaveBeenCalledWith(
                SAILS_VVL_STORAGE,
                { [SAILS_PARAM_ATOMIC_ID]: 'atomic123' },
                { atomicId: 'atomic123' },
                { shouldDeepMerge: true },
            );

            expect(tariffSelectors.selectActiveOffer).not.toHaveBeenCalledWith(mockState);
            expect(createTrackingData).not.toHaveBeenCalled();
        });
    });

    describe('toggleAccordionItem listener', () => {
        let unsubscribe: UnsubscribeListener;

        beforeAll(() => {
            unsubscribe = listeners.toggleAccordionItem();
        });

        afterAll(() => {
            unsubscribe();
        });

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should track information when accordion item is opened', () => {
            const dispatchMock = jest.fn();
            const getStateMock = jest.fn();
            const mockState = {};
            const mockHeadline = 'Test Accordion Headline';
            const decodedHeadline = 'Decoded Headline';

            (decodeHtml as jest.Mock).mockReturnValue(decodedHeadline);
            (trackIt as jest.Mock).mockReturnValue({ tracking: 'data' });

            listener.middleware({
                dispatch: dispatchMock,
                getState: getStateMock.mockReturnValue(mockState),
            })(() => (action: any) => action)(toggleAccordionItem({
                optOpen: true,
                stdHeadline: mockHeadline,
                stdId: 'test-id',
                containerAnyComponent: undefined,
            }));

            const trackingPayload = {
                /* eslint-disable camelcase, @typescript-eslint/naming-convention */
                information_action: TRACKING_INFORMATION_ACTION_REVEAL,
                information_ui_type: TrackingInformationUiType.Faq,
                information_trigger: TrackingInformationTrigger.Accordion,
                information_name: decodedHeadline,
            };

            expect(decodeHtml).toHaveBeenCalledWith(mockHeadline);
            expect(trackIt).toHaveBeenCalledWith(
                TrackType.Information,
                trackingPayload,
            );
        });

        it('should not track information when accordion item is closed', () => {
            const dispatchMock = jest.fn();
            const getStateMock = jest.fn();
            const mockState = {};

            listener.middleware({
                dispatch: dispatchMock,
                getState: getStateMock.mockReturnValue(mockState),
            })(() => (action: any) => action)(toggleAccordionItem({
                optOpen: false,
                stdHeadline: 'Test Accordion Headline',
                stdId: 'test-id',
                containerAnyComponent: undefined,
            }));

            expect(trackIt).not.toHaveBeenCalled();
            expect(decodeHtml).not.toHaveBeenCalled();
        });

        it('should handle undefined optOpen as closed accordion item', () => {
            const dispatchMock = jest.fn();
            const getStateMock = jest.fn();
            const mockState = {};

            listener.middleware({
                dispatch: dispatchMock,
                getState: getStateMock.mockReturnValue(mockState),
            })(() => (action: any) => action)(toggleAccordionItem({
                optOpen: undefined,
                stdHeadline: 'Test Accordion Headline',
                stdId: 'test-id',
                containerAnyComponent: undefined,
            } as any));

            expect(trackIt).not.toHaveBeenCalled();
            expect(decodeHtml).not.toHaveBeenCalled();
        });
    });
});
