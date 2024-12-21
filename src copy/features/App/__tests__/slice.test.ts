import {
    SalesChannel,
    SALESCHANNEL_CONSUMER,
} from '@vfde-sails/constants';
import appSlice, {
    setDefaultState,
    setSalesChannel,
    goToBasket,
    goToFamilyCard,
    trackPageView,
    setIsGigakombiEligible,
    toggleAccordion,
    setIsTradeIn,
} from '../slice';
import produce from 'immer';
import type { IInitialState } from '../interfaces/state';
import { startAuthentication } from '@vfde-sails/vvl';

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
                const isRedplusEligible = false;
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
                    isRedplusEligible,
                };
                const expected = {
                    type: expect.any(String),
                    payload: fixture,
                };

                expect(
                    setDefaultState({
                        salesChannel,
                        deviceId,
                        isSimonlyEligible,
                        isYoungEligible,
                        isGigakombiEligible,
                        gigakombiType,
                        isTradeIn,
                        isTauschbonus,
                        isTauschbonusEligible,
                        isRedplusEligible,
                    }),
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
            const isRedplusEligible = false;

            const expected = produce(appSlice.getInitialState(), state => {
                state.salesChannel = salesChannel;
                state.deviceId = deviceId;
                state.isSimonlyEligible = isSimonlyEligible;
                state.isYoungEligible = isYoungEligible;
                state.isGigakombiEligible = isGigakombiEligible;
                state.gigakombiType = gigakombiType;
                state.isTradeIn = isTradeIn;
                state.isTauschbonus = isTauschbonus;
                state.isTauschbonusEligible = isTauschbonusEligible;
                state.isRedplusEligible = isRedplusEligible;
            });
            expect(appSlice.reducer(appSlice.getInitialState(), setDefaultState({ salesChannel, deviceId, isSimonlyEligible, isYoungEligible, isGigakombiEligible, gigakombiType, isTradeIn, isTauschbonus, isTauschbonusEligible, isRedplusEligible }))).toEqual(expected);
        });

        it('should handle the setSalesChannel action correctly', () => {
            const salesChannel: SalesChannel = SALESCHANNEL_CONSUMER;

            const expected = produce(appSlice.getInitialState(), state => {
                state.salesChannel = salesChannel;
            });
            expect(appSlice.reducer(appSlice.getInitialState(), setSalesChannel(salesChannel))).toEqual(expected);
        });

        it('should handle the setIsGigakombiEligible action correctly', () => {
            const isGigakombiEligible = true;

            const expected = produce(appSlice.getInitialState(), state => {
                state.isGigakombiEligible = isGigakombiEligible;
            });
            expect(appSlice.reducer(appSlice.getInitialState(), setIsGigakombiEligible(isGigakombiEligible))).toEqual(expected);
        });
    });

    describe('extraReducer', () => {
        describe('startAuthentication.pending', ()=>{
            it('should set isLoading to true', ()=>{
                const initialState: Pick<IInitialState, 'loading'> = {
                    loading: {
                        startVvlAuth: false,
                    },
                };
                const action = { type: startAuthentication.pending.type };
                const state = appSlice.reducer((initialState as IInitialState), action);

                expect(state.loading.startVvlAuth).toEqual(true);
            });
        });
        describe('startAuthentication.fulfilled', ()=>{
            it('should set isLoading to false', ()=>{
                const initialState: Pick<IInitialState, 'loading'> = {
                    loading: {
                        startVvlAuth: false,
                    },
                };
                const action = { type: startAuthentication.fulfilled.type };
                const state = appSlice.reducer((initialState as IInitialState), action);

                expect(state.loading.startVvlAuth).toEqual(false);
            });
        });
    });
});
