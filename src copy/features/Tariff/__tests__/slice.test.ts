import produce from 'immer';
import tariffSlice, {
    setDefaultState,
    setPromotionalSummaryCardOffer,
    setSubscriptionId,
} from '../slice';
import { RED_M_VIRTUAL_ID } from '@vfde-sails/constants';
import { PromotionalSummaryCardOffer } from '../interfaces/interface';

describe('VVL Device Details App Slice', () => {
    describe('Actions', () => {

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

        it('should return the correct type', () => {
            const promotionalSummaryCardOffer: PromotionalSummaryCardOffer = { offerPrice: 10 };
            const expected = {
                type: expect.any(String),
                payload: promotionalSummaryCardOffer,
            };

            expect(setPromotionalSummaryCardOffer(promotionalSummaryCardOffer)).toEqual(expected);
        });

        it('should return the correct type', () => {
            const expected = {
                type: expect.any(String),
            };

            expect(setDefaultState()).toEqual(expected);
        });

    });

    describe('Reducer', () => {
        it('should return the init reducer state', () => {
            expect(tariffSlice.reducer(undefined, {} as any)).toEqual(tariffSlice.getInitialState());
        });

        it('should return the init tariffSlice.getInitialState()', () => {
            expect(tariffSlice.reducer(tariffSlice.getInitialState(), {} as any)).toEqual(tariffSlice.getInitialState());
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
