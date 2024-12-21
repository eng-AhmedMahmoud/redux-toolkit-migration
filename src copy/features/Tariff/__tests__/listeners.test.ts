import { UnsubscribeListener } from '@reduxjs/toolkit';
import { listener } from '../../../app/listener';
import {
    listeners,
    startListeners,
} from '../listeners';
import * as tariffSelectors from '../selectors';
import * as appSelectors from '../../App/selectors';
import { TariffWithHardwareOffer } from '@vfde-sails/glados-v2';
import {
    getTariffWithHardware,
    gladosApi,
} from '../../../api/glados';
import {
    setDefaultState,
    setSubscriptionId,
} from '../slice';
import {
    SAILS_PARAM_SUB_ID,
    SAILS_VVL_STORAGE,
    SalesChannel,
    SALESCHANNEL_CONSUMER,
    URL_PARAM_SUBGROUP_ID,
} from '@vfde-sails/constants';
import { setSalesChannel } from '../../App/slice';
import {
    createUrlWithQueryString,
    hasQueryParam,
    updateUrl,
} from '@vfde-sails/utils';
import { updateStorage as updateStorageHelper } from '@vfde-sails/storage';
import { createTrackingData } from '../../App/helpers/tracking';

jest.mock('../../../helpers/getUserDataHelper', () =>({
    getSubscriptionId: jest.fn().mockReturnValue('137'),
}));

jest.mock('@vfde-sails/utils', () =>({
    hasQueryParam: jest.fn(),
    updateUrl: jest.fn(),
    createUrlWithQueryString: jest.fn(),
}));

jest.mock('@vfde-sails/storage', () =>({
    updateStorage: jest.fn(),
    getSessionStorageItemJson: jest.fn().mockReturnValue({ activeSubscriptionId: { young: '138' } }),
}));

jest.mock('../../App/helpers/tracking', () =>({
    createTrackingData: jest.fn(),
}));

jest.mock('../../App/selectors.ts');
jest.mock('../selectors.ts');

describe('Tariff listeners', () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('startListeners', () => {
        expect(() => {
            startListeners()();
        }).not.toThrow();
    });

    describe('getSubscriptionsFulfilled listener', () => {
        let unsubscribe: UnsubscribeListener;

        beforeAll(() => {
            unsubscribe = listeners.getSubscriptionsFulfilled();
        });

        afterAll(() => {
            unsubscribe();
        });

        it('should dispatch setSubscriptionId if subscriptionId does not exist in offers', () => {
            const offers = [{ virtualItemId: '135' }, { virtualItemId: '137' }] as TariffWithHardwareOffer[];
            jest.spyOn(tariffSelectors, 'selectSubscriptionId').mockReturnValue('138');
            jest.spyOn(tariffSelectors, 'selectActiveOffers').mockReturnValue(offers);

            const dispatchMock = jest.fn();
            const getStateMock = jest.fn();
            const mockState = {};

            listener.middleware({
                dispatch: dispatchMock,
                getState: getStateMock.mockReturnValue(mockState),
            })(() => (action: any) => action)({
                type: `${gladosApi.reducerPath}/executeQuery/fulfilled`,
                meta: {
                    arg: {
                        endpointName: getTariffWithHardware.name,
                    },
                },
            });

            expect(dispatchMock).toHaveBeenCalledWith(
                setSubscriptionId('137'),
            );
        });

        it('shouldn\'t dispatch setSubscriptionId if subscriptionId exists in offers', () => {
            const offers = [{ virtualItemId: '135' }, { virtualItemId: '137' }] as TariffWithHardwareOffer[];
            jest.spyOn(tariffSelectors, 'selectSubscriptionId').mockReturnValue('135');
            jest.spyOn(tariffSelectors, 'selectActiveOffers').mockReturnValue(offers);

            const dispatchMock = jest.fn();
            const getStateMock = jest.fn();
            const mockState = {};

            listener.middleware({
                dispatch: dispatchMock,
                getState: getStateMock.mockReturnValue(mockState),
            })(() => (action: any) => action)({
                type: `${gladosApi.reducerPath}/executeQuery/fulfilled`,
                meta: {
                    arg: {
                        endpointName: getTariffWithHardware.name,
                    },
                },
            });

            expect(dispatchMock).not.toHaveBeenCalled();
        });
    });

    describe('setSubscriptionId listener', () => {
        let unsubscribe: UnsubscribeListener;

        beforeAll(() => {
            unsubscribe = listeners.setSubscriptionId();
        });

        afterAll(() => {
            unsubscribe();
        });

        const testSubscriptionId = (triggerAction: any) => {
            it('should dispatch setSubscriptionId if salesChannel had a value', () => {

                jest.spyOn(appSelectors, 'selectSalesChannel').mockReturnValue(SALESCHANNEL_CONSUMER);

                const dispatchMock = jest.fn();
                const getStateMock = jest.fn();
                const mockState = {};

                listener.middleware({
                    dispatch: dispatchMock,
                    getState: getStateMock.mockReturnValue(mockState),
                })(() => (action: any) => action)({
                    type: triggerAction.type,
                });

                expect(dispatchMock).toHaveBeenCalledWith(
                    setSubscriptionId('137', true, false),
                );
            });

            it('shouldn\'t dispatch setSubscriptionId if salesChannel is null', () => {
                jest.spyOn(appSelectors, 'selectSalesChannel').mockReturnValue(null);

                const dispatchMock = jest.fn();
                const getStateMock = jest.fn();
                const mockState = {};

                listener.middleware({
                    dispatch: dispatchMock,
                    getState: getStateMock.mockReturnValue(mockState),
                })(() => (action: any) => action)({
                    type: triggerAction.type,
                });

                expect(dispatchMock).not.toHaveBeenCalled();
            });
        };

        testSubscriptionId(setDefaultState);
        testSubscriptionId(setSalesChannel);
    });

    describe('setSubscriptionIdInStorage listener', () => {
        let unsubscribe: UnsubscribeListener;

        beforeAll(() => {
            unsubscribe = listeners.setSubscriptionIdInStorage();
        });

        afterAll(() => {
            unsubscribe();
        });

        it('updates storage and does not track page view when updateStorage is true and salesChannel exists', () => {
            const mockedState = { salesChannel: 'young' as SalesChannel };
            const actionPayload = {
                subscriptionId: '138',
                updateStorage: true,
                shouldTrackPageView: false,
            };

            jest.spyOn(appSelectors, 'selectSalesChannel').mockReturnValue(mockedState.salesChannel);
            (hasQueryParam as jest.Mock).mockReturnValue(false);

            const dispatchMock = jest.fn();
            const getStateMock = jest.fn().mockReturnValue(mockedState);

            listener.middleware({
                dispatch: dispatchMock,
                getState: getStateMock,
            })(() => (action: any) => action)({
                type: setSubscriptionId.type,
                payload: actionPayload,
            });

            expect(updateStorageHelper).toHaveBeenCalledWith(
                SAILS_VVL_STORAGE,
                { [SAILS_PARAM_SUB_ID]: { [mockedState.salesChannel]: actionPayload.subscriptionId } },
                { activeSubscriptionId: { young: '138' } },
                { shouldDeepMerge: true },
            );
            expect(dispatchMock).not.toHaveBeenCalled();
        });

        it('tracks page view when shouldTrackPageView is true', () => {
            const mockedState = { salesChannel: 'young' as SalesChannel };
            const actionPayload = {
                subscriptionId: '138',
                updateStorage: false,
                shouldTrackPageView: true,
            };

            jest.spyOn(appSelectors, 'selectSalesChannel').mockReturnValue(mockedState.salesChannel);

            const dispatchMock = jest.fn();
            const getStateMock = jest.fn().mockReturnValue(mockedState);

            listener.middleware({
                dispatch: dispatchMock,
                getState: getStateMock,
            })(() => (action: any) => action)({
                type: setSubscriptionId.type,
                payload: actionPayload,
            });

            expect(createTrackingData).toHaveBeenCalledWith(mockedState);
        });

        it('updates URL with the subscriptionId when URL_PARAM_SUBGROUP_ID exists', () => {
            const actionPayload = {
                subscriptionId: '138',
                updateStorage: false,
                shouldTrackPageView: false,
            };

            (hasQueryParam as jest.Mock).mockReturnValue(true);

            const dispatchMock = jest.fn();
            const getStateMock = jest.fn();

            listener.middleware({
                dispatch: dispatchMock,
                getState: getStateMock,
            })(() => (action: any) => action)({
                type: setSubscriptionId.type,
                payload: actionPayload,
            });

            expect(updateUrl).toHaveBeenCalledWith(
                createUrlWithQueryString(URL_PARAM_SUBGROUP_ID, actionPayload.subscriptionId),
                true,
            );
        });

        it('does nothing when updateStorage is false and salesChannel does not exist', () => {
            const mockedState = { sales: { salesChannel: null } };
            const actionPayload = {
                subscriptionId: '138',
                updateStorage: false,
                shouldTrackPageView: false,
            };

            jest.spyOn(appSelectors, 'selectSalesChannel').mockReturnValue(null);

            const dispatchMock = jest.fn();
            const getStateMock = jest.fn().mockReturnValue(mockedState);

            listener.middleware({
                dispatch: dispatchMock,
                getState: getStateMock,
            })(() => (action: any) => action)({
                type: setSubscriptionId.type,
                payload: actionPayload,
            });

            expect(dispatchMock).not.toHaveBeenCalled();
        });

    });

});
