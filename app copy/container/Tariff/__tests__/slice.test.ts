import produce from 'immer';
import tariffSlice, {
    getSubscriptions,
    getSubscriptionsFailed,
    getSubscriptionsSuccess,
    setDefaultState,
    setPromotionalSummaryCardOffer,
    setSubscriptionId,
} from '../slice';
import { TariffWithHardwareResponse } from '@vfde-sails/glados-v2';
import {
    RED_M_VIRTUAL_ID,
    RedTariff,
    YoungTariff,
} from '@vfde-sails/constants';
import { PromotionalSummaryCardOffer } from '../interface';

describe('VVL Device Details App Slice', () => {
    describe('Actions', () => {
        describe('getSubscriptions', () => {
            it('should return the correct type', () => {
                const expected = {
                    type: expect.any(String),
                };

                expect(getSubscriptions()).toEqual(expected);
            });
        });

        describe('getSubscriptionsSuccess', () => {
            it('should return the correct type', () => {
                const fixture = {
                    foo: 'bar',
                } as unknown as TariffWithHardwareResponse<RedTariff | YoungTariff>;
                const expected = {
                    type: expect.any(String),
                    payload: fixture,
                };

                expect(getSubscriptionsSuccess(fixture)).toEqual(expected);
            });
        });

        describe('getSubscriptionsFailed', () => {
            it('should return the correct type', () => {
                const expected = {
                    type: expect.any(String),
                };

                expect(getSubscriptionsFailed()).toEqual(expected);
            });
        });

        describe('setSubscriptionId', () => {
            it('should return the correct type', () => {
                const expected = {
                    type: expect.any(String),
                    payload: {
                        subscriptionId: RED_M_VIRTUAL_ID,
                        updateStorage: false,
                        shouldTrackPageView: true,
                    },
                };

                expect(setSubscriptionId(RED_M_VIRTUAL_ID, false, true)).toEqual(expected);
            });
        });

        describe('setPromotionalSummaryCardOffer', () => {
            it('should return the correct type', () => {
                const promotionalSummaryCardOffer: PromotionalSummaryCardOffer = { offerPrice: 10 };
                const expected = {
                    type: expect.any(String),
                    payload: promotionalSummaryCardOffer,
                };

                expect(setPromotionalSummaryCardOffer(promotionalSummaryCardOffer)).toEqual(expected);
            });
        });

        describe('setDefaultState', () => {
            it('should return the correct type', () => {
                const expected = {
                    type: expect.any(String),
                };

                expect(setDefaultState()).toEqual(expected);
            });
        });
    });

    describe('Reducer', () => {
        it('should return the init reducer state', () => {
            expect(tariffSlice.reducer(undefined, {} as any)).toEqual(tariffSlice.getInitialState());
        });

        it('should return the init tariffSlice.getInitialState()', () => {
            expect(tariffSlice.reducer(tariffSlice.getInitialState(), {} as any)).toEqual(tariffSlice.getInitialState());
        });

        it('should handle getSubscription correctly', () => {
            expect(tariffSlice.reducer(tariffSlice.getInitialState(), getSubscriptions())).toEqual(produce(tariffSlice.getInitialState(), draft => {
                draft.loading.getSubscription = true;
            }));
        });

        it('should handle getSubscriptionSuccess correctly', () => {
            const fixture = {
                foo: 'bar',
            } as unknown as TariffWithHardwareResponse<RedTariff | YoungTariff>;

            const expected = produce(tariffSlice.getInitialState(), draft => {
                draft.loading.getSubscription = false;
                draft.subscriptionPayload = fixture;
            });
            expect(tariffSlice.reducer(tariffSlice.getInitialState(), getSubscriptionsSuccess(fixture))).toEqual(expected);
        });

        it('should handle the getSubscriptionFailed action correctly', () => {

            const expected = produce(tariffSlice.getInitialState(), draft => {
                draft.loading.getSubscription = false;
                draft.errors.getSubscription = true;
            });
            expect(tariffSlice.reducer(tariffSlice.getInitialState(), getSubscriptionsFailed())).toEqual(expected);
        });

        it('should handle the setSubscriptionId action correctly', () => {
            const expected = produce(tariffSlice.getInitialState(), draft => {
                draft.subscriptionId = RED_M_VIRTUAL_ID;
            });
            expect(tariffSlice.reducer(tariffSlice.getInitialState(), setSubscriptionId(RED_M_VIRTUAL_ID))).toEqual(expected);
        });

        it('should handle the setPromotionalSummaryCardOffer action correctly', () => {
            const promotionalSummaryCardOffer = { offerPrice: 10 };
            const expected = produce(tariffSlice.getInitialState(), draft => {
                draft.promotionalSummaryCardOffer = promotionalSummaryCardOffer;
            });
            expect(tariffSlice.reducer(tariffSlice.getInitialState(), setPromotionalSummaryCardOffer(promotionalSummaryCardOffer))).toEqual(expected);
        });
    });
});
