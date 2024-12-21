import { listener } from '../../../app/listener';
import {
    listeners,
    startListeners,
} from '../listeners';
import * as tradeInSelectors from '../selectors';
import * as appSelectors from '../../App/selectors';
import * as tariffSelectors from '../../Tariff/selectors';
import {
    deleteSelectedTradeInDevice,
    setDevices,
    setIsTradeInSelected,
    setSelectedTradeInDeviceId,
} from '../slice';
import { updateStorage } from '@vfde-sails/storage';
import {
    RED_M_VIRTUAL_ID,
    SAILS_PARAM_TAUSCHBONUS,
    SAILS_PARAM_TRADE_IN,
    SAILS_VVL_STORAGE,
    SalesChannel,
} from '@vfde-sails/constants';
import { getTariffWithHardware } from '../../../api/glados';
import { getTradeInTrackingPayload } from '../../App/helpers/tracking';
import { setIsTradeIn } from '../../App/slice';
import { trackIt } from '@vfde-sails/tracking';
import { SAILS_PARAM_TRADE_IN_DEVICE } from '../constants';

jest.mock('@vfde-sails/storage', () => ({
    updateStorage: jest.fn(),
    getSessionStorageItemJson: jest.fn().mockReturnValue({}),
}));
jest.mock('../../App/helpers/tracking', () => ({
    getTradeInTrackingPayload: jest.fn(),
}));
jest.mock('@vfde-sails/tracking', () => ({
    trackIt: jest.fn(),
}));
jest.mock('../../../api/glados', () => ({
    getTariffWithHardware: {
        initiate: jest.fn(),
    },
}));
jest.mock('../selectors');
jest.mock('../../App/selectors');
jest.mock('../../Tariff/selectors');
jest.mock('../../../api/glados');

describe('tradeIn listeners', () => {
    let unsubscribe: () => void;

    beforeEach(() => {
        unsubscribe = startListeners();
    });

    afterEach(() => {
        unsubscribe();
        jest.clearAllMocks();
    });

    test('startListeners', () => {
        expect(() => {
            startListeners()();
        }).not.toThrow();
    });

    describe('setIsTradeInSelected listener', () => {

        beforeAll(() => {
            unsubscribe = listeners.setIsTradeInSelected();
        });

        afterAll(() => {
            unsubscribe();
        });

        // Mock Device Data
        const mockDevice = {
            id: '1',
            name: 'Device 1',
            maxPrice: 300,
            formattedPrice: '$300',
            imgSrc: 'img1.jpg',
        };
        it('should track and dispatch the setTradeIn action', () => {
            const isTradeIn = true;

            jest.spyOn(tradeInSelectors, 'selectIsTradeInSelected').mockReturnValue(true);
            jest.spyOn(tradeInSelectors, 'selectSelectedTradeInDevice').mockReturnValue(mockDevice);
            jest.spyOn(tradeInSelectors, 'selectTradeIn').mockReturnValue(true);

            const tradeInTrackingPayload = {
                trackingType: 'foo',
                trackingPayload: 'bar',
            };

            (getTradeInTrackingPayload as jest.Mock).mockReturnValueOnce(tradeInTrackingPayload);

            const dispatchMock = jest.fn();

            listener.middleware({
                dispatch: dispatchMock,
                getState: jest.fn(),
            })(() => (action: any) => action)(
                setIsTradeInSelected(true),
            );

            expect(trackIt).toHaveBeenCalledTimes(1);
            expect(trackIt).toHaveBeenNthCalledWith(1, tradeInTrackingPayload.trackingType, tradeInTrackingPayload.trackingPayload);

            expect(dispatchMock).toHaveBeenCalledTimes(1);
            expect(dispatchMock).toHaveBeenNthCalledWith(1, setIsTradeIn(isTradeIn));
        });

        it('should dispatch setDevices with selectedTradeInDevice array when tradeIn is deactivated and there is a selected device', () => {
            jest.spyOn(tradeInSelectors, 'selectIsTradeInSelected').mockReturnValue(false);
            jest.spyOn(tradeInSelectors, 'selectSelectedTradeInDevice').mockReturnValue(mockDevice);
            jest.spyOn(tradeInSelectors, 'selectTradeIn').mockReturnValue(false);

            const tradeInTrackingPayload = {
                trackingType: 'foo',
                trackingPayload: 'bar',
            };

            (getTradeInTrackingPayload as jest.Mock).mockReturnValueOnce(tradeInTrackingPayload);

            const dispatchMock = jest.fn();

            listener.middleware({
                dispatch: dispatchMock,
                getState: jest.fn(),
            })(() => (action: any) => action)(
                setIsTradeInSelected(false),
            );

            expect(trackIt).toHaveBeenCalledTimes(1);
            expect(trackIt).toHaveBeenCalledWith(tradeInTrackingPayload.trackingType, tradeInTrackingPayload.trackingPayload);

            expect(dispatchMock).toHaveBeenCalledWith(setIsTradeIn(false));
            expect(dispatchMock).toHaveBeenCalledWith(setDevices([mockDevice]));
        });

        it('should dispatch setDevices with null when tradeIn is deactivated and there is no selected device', () => {
            jest.spyOn(tradeInSelectors, 'selectIsTradeInSelected').mockReturnValue(false);
            jest.spyOn(tradeInSelectors, 'selectSelectedTradeInDevice').mockReturnValue(null);
            jest.spyOn(tradeInSelectors, 'selectTradeIn').mockReturnValue(false);

            const tradeInTrackingPayload = {
                trackingType: 'foo',
                trackingPayload: 'bar',
            };

            (getTradeInTrackingPayload as jest.Mock).mockReturnValueOnce(tradeInTrackingPayload);

            const dispatchMock = jest.fn();

            listener.middleware({
                dispatch: dispatchMock,
                getState: jest.fn(),
            })(() => (action: any) => action)(
                setIsTradeInSelected(false),
            );

            expect(trackIt).toHaveBeenCalledTimes(1);
            expect(trackIt).toHaveBeenCalledWith(tradeInTrackingPayload.trackingType, tradeInTrackingPayload.trackingPayload);

            expect(dispatchMock).toHaveBeenCalledWith(setIsTradeIn(false));
            expect(dispatchMock).toHaveBeenCalledWith(setDevices(null));
        });
    });

    describe('setSelectedTradeInDeviceId listener', () => {

        beforeAll(() => {
            unsubscribe = listeners.setSelectedTradeInDeviceId();
        });

        afterAll(() => {
            unsubscribe();
        });

        const testCases = [
            {
                selectedTradeInDevice: { id: 'foo' },
            },
            {
                selectedTradeInDevice: null,
            },
        ];

        it.each(testCases)('should update storage, track and dispatch the setIsTradeIn action %#', testCase => {
            const { selectedTradeInDevice } = testCase;
            const hasTradeInDevice = !!selectedTradeInDevice;
            const isTauschbonusEligible = true;

            jest.spyOn(tradeInSelectors, 'selectSelectedTradeInDevice').mockReturnValueOnce(
                selectedTradeInDevice as ReturnType<typeof tradeInSelectors.selectSelectedTradeInDevice>,
            );
            jest.spyOn(appSelectors, 'selectIsTauschbonusEligible').mockReturnValueOnce(isTauschbonusEligible);

            const trackingType = 'foo';
            const trackingPayload = 'bar';

            (getTradeInTrackingPayload as jest.Mock).mockReturnValueOnce({ trackingType, trackingPayload });

            const dispatchMock = jest.fn();

            listener.middleware({
                dispatch: dispatchMock,
                getState: jest.fn(),
            })(() => (action: any) => action)(
                setSelectedTradeInDeviceId(null),
            );

            expect(dispatchMock).toHaveBeenCalledWith(setIsTradeIn(hasTradeInDevice));

            if (selectedTradeInDevice) {
                expect(trackIt).toHaveBeenCalledWith(trackingType, trackingPayload);
                expect(updateStorage).toHaveBeenCalledWith(
                    SAILS_VVL_STORAGE,
                    {
                        [SAILS_PARAM_TRADE_IN]: true,
                        [SAILS_PARAM_TAUSCHBONUS]: isTauschbonusEligible && !!selectedTradeInDevice,
                        [SAILS_PARAM_TRADE_IN_DEVICE]: selectedTradeInDevice,
                    },
                    expect.anything(),
                    { shouldDeepMerge: false },
                );
            }
            else {
                expect(trackIt).not.toHaveBeenCalled();
                expect(updateStorage).not.toHaveBeenCalled();
            }
        });
    });

    describe('deleteSelectedTradeInDevice listener', () => {

        beforeAll(() => {
            unsubscribe = listeners.deleteSelectedTradeInDevice();
        });

        afterAll(() => {
            unsubscribe();
        });

        it('should update storage, track and dispatch the setIsTradeIn action', () => {
            const dispatchMock = jest.fn();
            const trackingType = 'foo';
            const trackingPayload = 'bar';

            (getTradeInTrackingPayload as jest.Mock).mockReturnValueOnce({ trackingType, trackingPayload });

            listener.middleware({
                dispatch: dispatchMock,
                getState: jest.fn(),
            })(() => (action: any) => action)({
                type: deleteSelectedTradeInDevice.type,
            });

            expect(dispatchMock).toHaveBeenCalledWith(setIsTradeIn(false));
            expect(trackIt).toHaveBeenCalledWith(trackingType, trackingPayload);
            expect(updateStorage).toHaveBeenCalledWith(
                SAILS_VVL_STORAGE,
                {
                    [SAILS_PARAM_TRADE_IN]: false,
                    [SAILS_PARAM_TAUSCHBONUS]: false,
                    [SAILS_PARAM_TRADE_IN_DEVICE]: null,
                },
                expect.anything(),
                { shouldDeepMerge: false },
            );
        });
    });

    describe('setIsTradeIn listener', () => {

        beforeAll(() => {
            unsubscribe = listeners.setIsTradeIn();
        });

        afterAll(() => {
            unsubscribe();
        });

        it('should trigger tariff API to fetch tauschbonus discount if eligible and subscriptionId exists', () => {
            const mockState = {
                isTauschbonusEligible: true,
                subscriptionId: RED_M_VIRTUAL_ID,
                salesChannel: 'consumer' as SalesChannel,
                isTradeIn: true,
            };

            jest.spyOn(appSelectors, 'selectIsTauschbonusEligible').mockReturnValue(true);
            jest.spyOn(tariffSelectors, 'selectSubscriptionId').mockReturnValue(RED_M_VIRTUAL_ID);
            jest.spyOn(appSelectors, 'selectSalesChannel').mockReturnValue('consumer');
            jest.spyOn(appSelectors, 'selectIsTradeIn').mockReturnValue(true);

            const dispatchMock = jest.fn();
            const getStateMock = jest.fn().mockReturnValue(mockState);

            listener.middleware({
                dispatch: dispatchMock,
                getState: getStateMock,
            })(() => (action: any) => action)({
                type: setIsTradeIn.type,
            });

            expect(dispatchMock).toHaveBeenCalledWith(
                getTariffWithHardware.initiate({ salesChannel: mockState.salesChannel, isTradeIn: mockState.isTradeIn }),
            );
        });

        it('should not trigger tariff API if not eligible', () => {
            const mockState = {
                isTauschbonusEligible: false,
                subscriptionId: RED_M_VIRTUAL_ID,
                salesChannel: 'salesChannel1' as SalesChannel,
                isTradeIn: true,
            };

            jest.spyOn(appSelectors, 'selectIsTauschbonusEligible').mockReturnValue(mockState.isTauschbonusEligible);
            jest.spyOn(tariffSelectors, 'selectSubscriptionId').mockReturnValue(mockState.subscriptionId);
            jest.spyOn(appSelectors, 'selectSalesChannel').mockReturnValue(mockState.salesChannel);
            jest.spyOn(appSelectors, 'selectIsTradeIn').mockReturnValue(mockState.isTradeIn);

            const dispatchMock = jest.fn();
            const getStateMock = jest.fn().mockReturnValue(mockState);

            listener.middleware({
                dispatch: dispatchMock,
                getState: getStateMock,
            })(() => (action: any) => action)({
                type: setIsTradeIn.type,
            });

            expect(dispatchMock).not.toHaveBeenCalledWith(
                getTariffWithHardware.initiate({ salesChannel: mockState.salesChannel, isTradeIn: mockState.isTradeIn }),
            );
        });

        it('should not trigger tariff API if subscriptionId is missing', () => {
            const mockState = {
                isTauschbonusEligible: true,
                subscriptionId: null,
                salesChannel: 'salesChannel1' as SalesChannel,
                isTradeIn: true,
            };

            jest.spyOn(appSelectors, 'selectIsTauschbonusEligible').mockReturnValue(mockState.isTauschbonusEligible);
            jest.spyOn(tariffSelectors, 'selectSubscriptionId').mockReturnValue(mockState.subscriptionId);
            jest.spyOn(appSelectors, 'selectSalesChannel').mockReturnValue(mockState.salesChannel);
            jest.spyOn(appSelectors, 'selectIsTradeIn').mockReturnValue(mockState.isTradeIn);

            const dispatchMock = jest.fn();
            const getStateMock = jest.fn().mockReturnValue(mockState);

            listener.middleware({
                dispatch: dispatchMock,
                getState: getStateMock,
            })(() => (action: any) => action)({
                type: setIsTradeIn.type,
            });

            expect(dispatchMock).not.toHaveBeenCalledWith(
                getTariffWithHardware.initiate({ salesChannel: mockState.salesChannel, isTradeIn: mockState.isTradeIn }),
            );
        });
    });

});
