import {
    SalesChannel,
    SALESCHANNEL_CONSUMER,
} from '@vfde-sails/constants';
import appSlice, {
    setDefaultState,
    setSalesChannel,
    setIsRedplusEligible,
    goToBasket,
    goToFamilyCard,
    trackPageView,
    setIsGigakombiEligible,
    toggleAccordion,
    setIsTradeIn,
} from '../slice';
import produce from 'immer';
import { vvlCustomerActionCreators } from '@vfde-sails/vvl';
import type { IInitialState } from '../interfaces/state';

describe('VVL Device Details App Slice', () => {
    describe('Actions', () => {
        describe('setDefaultState', () => {
            it('should return the correct type', () => {
                const salesChannel: SalesChannel = SALESCHANNEL_CONSUMER;
                const deviceId = '1234';
                const isSimonlyEligible = true;
                const isYoungEligible = true;
                const isGigakombiEligible = true;
                const gigakombiType = 'tv';
                const isTradeIn = true;
                const isTauschbonus = true;
                const isTauschbonusEligible = false;
                const fixture = {
                    salesChannel,
                    deviceId,
                    isSimonlyEligible,
                    isYoungEligible,
                    isGigakombiEligible,
                    gigakombiType,
                    isTradeIn,
                    isTauschbonus,
                    isTauschbonusEligible,
                };
                const expected = {
                    type: expect.any(String),
                    payload: fixture,
                };

                expect(
                    setDefaultState(
                        salesChannel,
                        deviceId,
                        isSimonlyEligible,
                        isYoungEligible,
                        isGigakombiEligible,
                        gigakombiType,
                        isTradeIn,
                        isTauschbonus,
                        isTauschbonusEligible,
                    ),
                ).toEqual(expected);
            });
        });

        describe('setSalesChannel', () => {
            it('should return the correct type', () => {
                const salesChannel: SalesChannel = SALESCHANNEL_CONSUMER;

                const expected = {
                    type: expect.any(String),
                    payload: salesChannel,
                };

                expect(setSalesChannel(salesChannel)).toEqual(expected);
            });
        });

        describe('setIsRedplusEligible', () => {
            it('should return the correct type', () => {
                const isRedplusEligible = true;

                const expected = {
                    type: expect.any(String),
                    payload: isRedplusEligible,
                };

                expect(setIsRedplusEligible(isRedplusEligible)).toEqual(expected);
            });
        });

        describe('setIsGigakombiEligible', () => {
            it('should return the correct type', () => {
                const isGigakombiEligible = true;

                const expected = {
                    type: expect.any(String),
                    payload: isGigakombiEligible,
                };

                expect(setIsGigakombiEligible(isGigakombiEligible)).toEqual(expected);
            });
        });

        describe('setIsTradeIn', () => {
            it('should return the correct type', () => {
                const initialState: Pick<IInitialState, 'isTradeIn' | 'isTauschbonus' | 'isTauschbonusEligible' | 'loading'> = {
                    isTradeIn: false,
                    isTauschbonus: false,
                    isTauschbonusEligible: true,
                    loading: {
                        startVvlAuth: false,
                    },
                };
                // Action to be dispatched
                const action = setIsTradeIn(true);
                // Call the reducer
                const newState = appSlice.reducer((initialState as IInitialState), action);

                expect(newState.isTradeIn).toEqual(true);
                expect(newState.isTauschbonus).toBe(true);
            });
        });

        describe('goToBasket', () => {
            it('should return the correct type', () => {
                const expected = {
                    type: expect.any(String),
                };

                expect(goToBasket()).toEqual(expected);
            });
        });

        describe('goToFamilyCard', () => {
            it('should return the correct type', () => {
                const expected = {
                    type: expect.any(String),
                };

                expect(goToFamilyCard()).toEqual(expected);
            });
        });

        describe('trackPageView', () => {
            it('should return the correct type', () => {
                const expected = {
                    type: expect.any(String),
                };

                expect(trackPageView()).toEqual(expected);
            });
        });

        describe('toggleAccordion', () => {
            it('should return the correct type', () => {
                const expected = {
                    type: expect.any(String),
                    payload: {
                        optOpen: true,
                        stdHeadline: 'foo',
                    },
                };

                expect(toggleAccordion({
                    optOpen: true,
                    stdHeadline: 'foo',
                })).toEqual(expected);
            });
        });
    });

    describe('Reducer', () => {
        it('should return the init reducer state', () => {
            expect(appSlice.reducer(undefined, {} as any)).toEqual(appSlice.getInitialState());
        });

        it('should return the init appSlice.getInitialState()', () => {
            expect(appSlice.reducer(appSlice.getInitialState(), {} as any)).toEqual(appSlice.getInitialState());
        });

        it('should handle the vvlAuthDone action correctly', () => {
            const expected = produce(appSlice.getInitialState(), draft => {
                draft.loading.startVvlAuth = false;
            });
            expect(appSlice.reducer(appSlice.getInitialState(), vvlCustomerActionCreators.vvlAuthDone())).toEqual(expected);
        });

        it('should handle the setDefaultState action correctly', () => {
            const salesChannel: SalesChannel = SALESCHANNEL_CONSUMER;
            const deviceId = '1234';
            const isSimonlyEligible = true;
            const isYoungEligible = true;
            const isGigakombiEligible = true;
            const gigakombiType = 'tv';
            const isTradeIn = true;
            const isTauschbonus = true;
            const isTauschbonusEligible = true;

            const expected = produce(appSlice.getInitialState(), draft => {
                draft.salesChannel = salesChannel;
                draft.deviceId = deviceId;
                draft.isSimonlyEligible = isSimonlyEligible;
                draft.isYoungEligible = isYoungEligible;
                draft.isGigakombiEligible = isGigakombiEligible;
                draft.gigakombiType = gigakombiType;
                draft.isTradeIn = isTradeIn;
                draft.isTauschbonus = isTauschbonus;
                draft.isTauschbonusEligible = isTauschbonusEligible;
            });
            expect(appSlice.reducer(appSlice.getInitialState(), setDefaultState(salesChannel, deviceId, isSimonlyEligible, isYoungEligible, isGigakombiEligible, gigakombiType, isTradeIn, isTauschbonus, isTauschbonusEligible))).toEqual(expected);
        });

        it('should handle the setSalesChannel action correctly', () => {
            const salesChannel: SalesChannel = SALESCHANNEL_CONSUMER;

            const expected = produce(appSlice.getInitialState(), draft => {
                draft.salesChannel = salesChannel;
            });
            expect(appSlice.reducer(appSlice.getInitialState(), setSalesChannel(salesChannel))).toEqual(expected);
        });

        it('should handle the setIsGigakombiEligible action correctly', () => {
            const isGigakombiEligible = true;

            const expected = produce(appSlice.getInitialState(), draft => {
                draft.isGigakombiEligible = isGigakombiEligible;
            });
            expect(appSlice.reducer(appSlice.getInitialState(), setIsGigakombiEligible(isGigakombiEligible))).toEqual(expected);
        });

        it('should handle the setisRedplusEligible action correctly', () => {
            const isRedplusEligible = true;

            const expected = produce(appSlice.getInitialState(), draft => {
                draft.isRedplusEligible = isRedplusEligible;
            });
            expect(appSlice.reducer(appSlice.getInitialState(), setIsRedplusEligible(isRedplusEligible))).toEqual(expected);
        });
    });
});
