import {
    OfferType,
    PriceType,
} from '@vfde-sails/glados-v2';
import optionsSlice from '../../Options/slice';
import { RootState } from '../../../app/store';
import appSlice from '../../App/slice';
import tariffSlice from '../slice';
import {
    RED_M_VIRTUAL_ID,
    RED_S_VIRTUAL_ID,
    SALESCHANNEL_CONSUMER,
    SalesChannel,
} from '@vfde-sails/constants';
import {
    selectTariffsErrorsFlag,
    selectTariffPrice,
    selectTariffPriceWithoutDiscounts,
    selectEndTariffPrice,
    selectDataVolume,
    selectEndDataVolume,
    selectStairway,
    selectStrikePrice,
    selectPriceToPay,
    selectEndPriceToPay,
    selectSubscriptionId,
    selectActiveOffer,
    selectSubscriptionPayload,
    selectActiveOffers,
    selectPromotionalSummaryCardOffer,
    selectTariffsLoadingFlag,
} from '../selectors';
import {
    getTariffWithHardware,
    gladosApi,
} from '../../../api/glados';
import { QueryStatus } from '@reduxjs/toolkit/query';

describe('tariff selectors', () => {

    const expectedTariffPriceA = {
        recurrenceStart: 1,
        recurrenceEnd: 24,
        recurrenceUnit: 'month',
        gross: 10,
    };

    const expectedTariffPriceB = {
        recurrenceStart: 1,
        recurrenceEnd: 6,
        recurrenceUnit: 'month',
        gross: 10,
    };

    const expectedDataVolumeA = {
        recurrenceStart: 1,
        recurrenceEnd: 24,
        unit: 'GB',
        unlimited: false,
        value: 10,
    };

    const expectedDataVolumeB = {
        recurrenceStart: 1,
        recurrenceEnd: 6,
        unit: 'GB',
        unlimited: false,
        value: 10,
    };

    const expectedActiveOffers = [{
        virtualItemId: RED_S_VIRTUAL_ID,
        prices: {
            [OfferType.Composition]: {
                [OfferType.SimOnly]: {
                    [PriceType.Monthly]: {
                        withDiscounts: [
                            expectedTariffPriceA,
                        ],
                        withoutDiscounts: {
                            gross: 20,
                            recurrenceStart: 1,
                            recurrenceEnd: 24,
                        },
                    },
                },
            },
        },
        dataVolume: {
            withDiscounts: [
                expectedDataVolumeA,
            ],
            withoutDiscounts: {
                recurrenceStart: 1,
                recurrenceEnd: 24,
                unit: 'GB',
                unlimited: false,
                value: 20,
            },
        },
    }, {
        virtualItemId: RED_M_VIRTUAL_ID,
        prices: {
            [OfferType.Composition]: {
                [OfferType.SimOnly]: {
                    [PriceType.Monthly]: {
                        withDiscounts: [
                            expectedTariffPriceA,
                        ],
                        withoutDiscounts: {
                            gross: 20,
                            recurrenceStart: 1,
                            recurrenceEnd: 24,
                        },
                    },
                },
            },
        },
        dataVolume: {
            withDiscounts: [
                expectedDataVolumeA,
            ],
            withoutDiscounts: {
                recurrenceStart: 1,
                recurrenceEnd: 24,
                unit: 'GB',
                unlimited: false,
                value: 20,
            },
        },
    }];

    const mockedStateWithNull: RootState = {
        [optionsSlice.name]: {
            atomicId: '1234',
        },
        [appSlice.name]: {
            salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
            isTradeIn: true,
        },
        [gladosApi.reducerPath]: {
            queries: {
                [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                    status: QueryStatus.fulfilled,
                    data: null,
                },
            },
        },
    } as RootState;

    const mockedStateWithOneItemDiscount: RootState = {
        [tariffSlice.name]: {
            subscriptionId: RED_M_VIRTUAL_ID,
        },
        [optionsSlice.name]: {
            atomicId: '1234',
        },
        [appSlice.name]: {
            salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
            isTradeIn: true,
        },
        [gladosApi.reducerPath]: {
            queries: {
                [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                    status: QueryStatus.fulfilled,
                    data: {
                        data: [
                            {
                                hardware: {
                                    hardwareId: '1234',
                                },
                                tariffs: [{
                                    virtualItemId: RED_M_VIRTUAL_ID,
                                    prices: {
                                        [OfferType.Composition]: {
                                            [OfferType.SimOnly]: {
                                                [PriceType.Monthly]: {
                                                    withDiscounts: [
                                                        expectedTariffPriceA,
                                                    ],
                                                    withoutDiscounts: {
                                                        gross: 20,
                                                        recurrenceStart: 1,
                                                        recurrenceEnd: 24,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    dataVolume: {
                                        withDiscounts: [
                                            expectedDataVolumeA,
                                        ],
                                        withoutDiscounts: {
                                            recurrenceStart: 1,
                                            recurrenceEnd: 24,
                                            unit: 'GB',
                                            unlimited: false,
                                            value: 20,
                                        },
                                    },
                                },
                                {
                                    virtualItemId: RED_S_VIRTUAL_ID,
                                    prices: {
                                        [OfferType.Composition]: {
                                            [OfferType.SimOnly]: {
                                                [PriceType.Monthly]: {
                                                    withDiscounts: [
                                                        expectedTariffPriceA,
                                                    ],
                                                    withoutDiscounts: {
                                                        gross: 20,
                                                        recurrenceStart: 1,
                                                        recurrenceEnd: 24,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    dataVolume: {
                                        withDiscounts: [
                                            expectedDataVolumeA,
                                        ],
                                        withoutDiscounts: {
                                            recurrenceStart: 1,
                                            recurrenceEnd: 24,
                                            unit: 'GB',
                                            unlimited: false,
                                            value: 20,
                                        },
                                    },
                                }],
                            },
                        ],
                    },
                },
            },
        },
    } as RootState;

    const mockedStateWithTwoItemsDiscount: RootState = {
        [tariffSlice.name]: {
            subscriptionId: RED_M_VIRTUAL_ID,
        },
        [optionsSlice.name]: {
            atomicId: '1234',
        },
        [appSlice.name]: {
            salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
            isTradeIn: true,
        },
        [gladosApi.reducerPath]: {
            queries: {
                [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                    status: QueryStatus.fulfilled,
                    data: {
                        data: [
                            {
                                hardware: {
                                    hardwareId: '1234',
                                },
                                tariffs: [
                                    {
                                        virtualItemId: RED_M_VIRTUAL_ID,
                                        prices: {
                                            [OfferType.Composition]: {
                                                [OfferType.SimOnly]: {
                                                    [PriceType.Monthly]: {
                                                        withDiscounts: [
                                                            expectedTariffPriceB,
                                                        ],
                                                        withoutDiscounts: {
                                                            gross: 20,
                                                            recurrenceStart: 7,
                                                            recurrenceEnd: 24,
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                        dataVolume: {
                                            withDiscounts: [
                                                expectedDataVolumeB,
                                                {
                                                    recurrenceStart: 1,
                                                    recurrenceEnd: 7,
                                                    unit: 'GB',
                                                    unlimited: false,
                                                    value: 20,
                                                },
                                            ],
                                            withoutDiscounts: {
                                                recurrenceStart: 1,
                                                recurrenceEnd: 6,
                                                unit: 'GB',
                                                unlimited: false,
                                                value: 30,
                                            },
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                },
            },
        },
    } as RootState;

    const mockedStateWithoutDiscountOneItem: RootState = {
        [tariffSlice.name]: {
            subscriptionId: RED_M_VIRTUAL_ID,
        },
        [optionsSlice.name]: {
            atomicId: '1234',
        },
        [appSlice.name]: {
            salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
            isTradeIn: true,
        },
        [gladosApi.reducerPath]: {
            queries: {
                [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                    status: QueryStatus.fulfilled,
                    data: {
                        data: [
                            {
                                hardware: {
                                    hardwareId: '1234',
                                },
                                tariffs: [
                                    {
                                        virtualItemId: RED_M_VIRTUAL_ID,
                                        prices: {
                                            [OfferType.Composition]: {
                                                [OfferType.SimOnly]: {
                                                    [PriceType.Monthly]: {
                                                        withoutDiscounts: expectedTariffPriceA,
                                                    },
                                                },
                                            },
                                        },
                                        dataVolume: {
                                            withoutDiscounts: expectedDataVolumeA,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                },
            },
        },
    } as RootState;

    const mockedStateWithoutDiscountTwoItems: RootState = {
        [tariffSlice.name]: {
            subscriptionId: RED_M_VIRTUAL_ID,
        },
        [optionsSlice.name]: {
            atomicId: '1234',
        },
        [appSlice.name]: {
            salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
            isTradeIn: true,
        },
        [gladosApi.reducerPath]: {
            queries: {
                [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                    status: QueryStatus.fulfilled,
                    data: {
                        data: [
                            {
                                hardware: {
                                    hardwareId: '1234',
                                },
                                tariffs: [
                                    {
                                        virtualItemId: RED_M_VIRTUAL_ID,
                                        prices: {
                                            [OfferType.Composition]: {
                                                [OfferType.SimOnly]: {
                                                    [PriceType.Monthly]: {
                                                        withoutDiscounts: expectedTariffPriceB,
                                                    },
                                                },
                                            },
                                        },
                                        dataVolume: {
                                            withoutDiscounts: expectedDataVolumeB,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                },
            },
        },
    } as RootState;

    const mockedStateWithNoMatchingIds: RootState = {
        [tariffSlice.name]: {
            subscriptionId: RED_M_VIRTUAL_ID,
        },
        [optionsSlice.name]: {
            atomicId: '1234',
        },
        [appSlice.name]: {
            salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
            isTradeIn: true,
        },
        [gladosApi.reducerPath]: {
            queries: {
                [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                    status: QueryStatus.fulfilled,
                    data: { data: [
                        {
                            hardware: {
                                hardwareId: '4567',
                            },
                            tariffs: [{
                                virtualItemId: RED_M_VIRTUAL_ID,
                                prices: {
                                    [OfferType.Composition]: {
                                        [OfferType.SimOnly]: {
                                            [PriceType.Monthly]: {
                                                withDiscounts: [
                                                    expectedTariffPriceA,
                                                ],
                                                withoutDiscounts: {
                                                    gross: 20,
                                                    recurrenceStart: 1,
                                                    recurrenceEnd: 24,
                                                },
                                            },
                                        },
                                    },
                                },
                                dataVolume: {
                                    withDiscounts: [
                                        expectedDataVolumeA,
                                    ],
                                    withoutDiscounts: {
                                        recurrenceStart: 1,
                                        recurrenceEnd: 24,
                                        unit: 'GB',
                                        unlimited: false,
                                        value: 20,
                                    },
                                },
                            }],
                        },
                    ] },
                },
            },
        },
    } as RootState;

    describe('selectTariffsErrorsFlag', () => {
        describe('should select the error state', () => {
            it('should return true if some have error', () => {
                const mockedState: RootState = {
                    [appSlice.name]: {
                        salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
                        isTradeIn: true,
                    },
                    [gladosApi.reducerPath]: {
                        queries: {
                            [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                                status: QueryStatus.rejected,
                            },
                        },
                    },
                } as RootState;
                expect(selectTariffsErrorsFlag(mockedState)).toEqual(true);
            });

            it('should return false if none have error', () => {
                const mockedState: RootState = {
                    [appSlice.name]: {
                        salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
                        isTradeIn: true,
                    },
                    [gladosApi.reducerPath]: {
                        queries: {
                            [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                                status: QueryStatus.fulfilled,
                            },
                        },
                    },
                } as RootState;
                expect(selectTariffsErrorsFlag(mockedState)).toEqual(false);
            });
        });

    });

    describe('selectTariffsLoadingFlag', () => {
        describe('should select the loading state', () => {
            it('should return true if loading', () => {
                const mockedState: RootState = {
                    [appSlice.name]: {
                        salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
                        isTradeIn: true,
                    },
                    [gladosApi.reducerPath]: {
                        queries: {
                            [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                                status: QueryStatus.pending,
                            },
                        },
                    },
                } as RootState;
                expect(selectTariffsLoadingFlag(mockedState)).toEqual(true);
            });

            it('should return false if it is not loading', () => {
                const mockedState: RootState = {
                    [appSlice.name]: {
                        salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
                        isTradeIn: true,
                    },
                    [gladosApi.reducerPath]: {
                        queries: {
                            [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                                status: QueryStatus.fulfilled,
                            },
                        },
                    },
                } as RootState;
                expect(selectTariffsLoadingFlag(mockedState)).toEqual(false);
            });
        });

    });

    describe('selectSubscriptionId', () => {
        it('should select the correct state', () => {
            const mockedState: RootState = {
                [tariffSlice.name]: {
                    subscriptionId: RED_M_VIRTUAL_ID,
                },
            } as RootState;

            expect(selectSubscriptionId(mockedState)).toEqual(RED_M_VIRTUAL_ID);
        });
    });

    describe('selectSubscriptionPayload', () => {
        it('should return null', () => {
            const mockedState: RootState = {
                [appSlice.name]: {
                    salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
                    isTradeIn: true,
                },
                [gladosApi.reducerPath]: {
                    queries: {
                        [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                            status: QueryStatus.fulfilled,
                            data: null,
                        },
                    },
                },
            } as unknown as RootState;
            expect(selectSubscriptionPayload(mockedState)).toBeNull();
        });
    });

    describe('selectActiveOffers', () => {
        it('should return null if there are no tariffs', () => {

            expect(selectActiveOffers(mockedStateWithNull)).toBeNull();
        });

        describe('with tariffs', () => {
            it('should return null if there is no match for the atomic id', () => {

                expect(selectActiveOffers(mockedStateWithNoMatchingIds)).toBeNull();
            });

            it('should return filtered active offers if ids are matched', () => {

                expect(selectActiveOffers(mockedStateWithOneItemDiscount)).toEqual(expectedActiveOffers);
            });
        });
    });

    describe('selectTariffPrice', () => {
        it('should return null when there is no offer', () => {
            expect(selectTariffPrice(mockedStateWithNull)).toBeNull();
        });

        describe('should return discounted tariff price first', () => {
            it('should return correctly when there is only one item', () => {
                expect(selectTariffPrice(mockedStateWithOneItemDiscount)).toEqual(expectedTariffPriceA);
            });

            it('should return object with runtimestart=1', () => {
                expect(selectTariffPrice(mockedStateWithTwoItemsDiscount)).toEqual(expectedTariffPriceB);
            });
        });

        describe('should fall back to tariff price without discounts', () => {

            it('should return correctly when there is only one item', () => {
                expect(selectTariffPrice(mockedStateWithoutDiscountOneItem)).toEqual(expectedTariffPriceA);
            });

            it('should return object with runtimestart=1', () => {
                expect(selectTariffPrice(mockedStateWithoutDiscountTwoItems)).toEqual(expectedTariffPriceB);
            });
        });
    });

    describe('selectTariffPriceWithoutDiscounts', () => {
        it('should return null when there is no offer', () => {
            expect(selectTariffPriceWithoutDiscounts(mockedStateWithNull)).toBeNull();
        });

        describe('should return tariff price without discount', () => {
            it('should return correctly when there is only one item', () => {
                expect(selectTariffPriceWithoutDiscounts(mockedStateWithoutDiscountOneItem)).toEqual(expectedTariffPriceA);
            });

            it('should return object with runtimestart=1', () => {
                expect(selectTariffPriceWithoutDiscounts(mockedStateWithoutDiscountTwoItems)).toEqual(expectedTariffPriceB);
            });
        });
    });

    describe('selectActiveOffer', () => {
        describe('should return null', () => {
            it('when there is no offer', () => {
                expect(selectActiveOffer(mockedStateWithNull)).toBeNull();
            });

            it('when there is no atomicId', () => {
                const mockedState: RootState = {
                    [tariffSlice.name]: {
                        subscriptionId: RED_M_VIRTUAL_ID,
                    },
                    [optionsSlice.name]: {
                        atomicId: null,
                    },
                    [appSlice.name]: {
                        salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
                        isTradeIn: true,
                    },
                    [gladosApi.reducerPath]: {
                        queries: {
                            [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                                status: QueryStatus.fulfilled,
                                data: {
                                    data: [
                                        {
                                            hardware: {
                                                hardwareId: '1234',
                                            },
                                            tariffs: [
                                                {
                                                    virtualItemId: RED_M_VIRTUAL_ID,
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    },
                } as RootState;
                expect(selectActiveOffer(mockedState)).toBeNull();
            });

            it('when there is no subscrptionId', () => {
                const mockedState: RootState = {
                    [tariffSlice.name]: {
                        subscriptionId: null,
                    },
                    [optionsSlice.name]: {
                        atomicId: '1234',
                    },
                    [appSlice.name]: {
                        salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
                        isTradeIn: true,
                    },
                    [gladosApi.reducerPath]: {
                        queries: {
                            [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                                status: QueryStatus.fulfilled,
                                data: {
                                    data: [
                                        {
                                            hardware: {
                                                hardwareId: '1234',
                                            },
                                            tariffs: [
                                                {
                                                    virtualItemId: RED_M_VIRTUAL_ID,
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    },
                } as RootState;
                expect(selectActiveOffer(mockedState)).toBeNull();
            });
        });

        it('should return the right offer', () => {
            const expected = {
                virtualItemId: RED_M_VIRTUAL_ID,
                prices: {
                    [OfferType.Composition]: {
                        [OfferType.SimOnly]: {
                            [PriceType.Monthly]: {
                                withoutDiscounts: {
                                    gross: 30,
                                    recurrenceStart: 1,
                                    recurrenceEnd: 24,
                                },
                            },
                        },
                    },
                },
            };
            const mockedState: RootState = {
                [tariffSlice.name]: {
                    subscriptionId: RED_M_VIRTUAL_ID,
                },
                [optionsSlice.name]: {
                    atomicId: '1234',
                },
                [appSlice.name]: {
                    salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
                    isTradeIn: true,
                },
                [gladosApi.reducerPath]: {
                    queries: {
                        [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                            status: QueryStatus.fulfilled,
                            data: {
                                data: [
                                    {
                                        hardware: {
                                            hardwareId: '1234',
                                        },
                                        tariffs: [
                                            expected,
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                },
            } as RootState;
            expect(selectActiveOffer(mockedState)).toEqual(expected);
        });

    });

    describe('selectEndTariffPrice', () => {

        it('should return null when there is no offer', () => {
            expect(selectEndTariffPrice(mockedStateWithNull)).toBeNull();
        });

        describe('should return discounted tariff price first', () => {
            it('should return correctly when there is only one item', () => {
                expect(selectEndTariffPrice(mockedStateWithOneItemDiscount)).toEqual(expectedTariffPriceA);
            });

            it('should return object with runtimeend=24', () => {
                const expected = {
                    gross: 20,
                    recurrenceStart: 7,
                    recurrenceEnd: 24,
                };

                const mockedState: RootState = {
                    [tariffSlice.name]: {
                        subscriptionId: RED_M_VIRTUAL_ID,
                    },
                    [optionsSlice.name]: {
                        atomicId: '1234',
                    },
                    [appSlice.name]: {
                        salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
                        isTradeIn: true,
                    },
                    [gladosApi.reducerPath]: {
                        queries: {
                            [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                                status: QueryStatus.fulfilled,
                                data: {
                                    data: [
                                        {
                                            hardware: {
                                                hardwareId: '1234',
                                            },
                                            tariffs: [
                                                {
                                                    virtualItemId: RED_M_VIRTUAL_ID,
                                                    prices: {
                                                        [OfferType.Composition]: {
                                                            [OfferType.SimOnly]: {
                                                                [PriceType.Monthly]: {
                                                                    withDiscounts: [
                                                                        expected,
                                                                        {
                                                                            gross: 10,
                                                                            recurrenceEnd: 6,
                                                                            recurrenceStart: 1,
                                                                        },
                                                                    ],
                                                                    withoutDiscounts: {
                                                                        gross: 30,
                                                                        recurrenceStart: 1,
                                                                        recurrenceEnd: 6,
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    },
                } as RootState;

                expect(selectEndTariffPrice(mockedState)).toEqual(expected);
            });
        });

        describe('should fall back to tariff price without discounts', () => {
            it('should return correctly when there is only one item', () => {
                expect(selectEndTariffPrice(mockedStateWithOneItemDiscount)).toEqual(expectedTariffPriceA);
            });

            it('should return object with runtimeend=24', () => {
                const expected = {
                    gross: 20,
                    recurrenceStart: 7,
                    recurrenceEnd: 24,
                };
                const mockedState: RootState = {
                    [tariffSlice.name]: {
                        subscriptionId: RED_M_VIRTUAL_ID,
                    },
                    [optionsSlice.name]: {
                        atomicId: '1234',
                    },
                    [appSlice.name]: {
                        salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
                        isTradeIn: true,
                    },
                    [gladosApi.reducerPath]: {
                        queries: {
                            [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                                status: QueryStatus.fulfilled,
                                data: {
                                    data: [
                                        {
                                            hardware: {
                                                hardwareId: '1234',
                                            },
                                            tariffs: [
                                                {
                                                    virtualItemId: RED_M_VIRTUAL_ID,
                                                    prices: {
                                                        [OfferType.Composition]: {
                                                            [OfferType.SimOnly]: {
                                                                [PriceType.Monthly]: {
                                                                    withoutDiscounts:
                                                                        expected,
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    },
                } as RootState;

                expect(selectEndTariffPrice(mockedState)).toEqual(expected);
            });
        });
    });

    describe('selectDataVolume', () => {
        it('should return null when there is no offer', () => {
            expect(selectDataVolume(mockedStateWithNull)).toBeNull();
        });

        describe('should return discounted data volume first', () => {
            it('should return correctly when there is only one item', () => {
                expect(selectDataVolume(mockedStateWithOneItemDiscount)).toEqual(expectedDataVolumeA);
            });

            it('should return object with runtimestart=1', () => {
                expect(selectDataVolume(mockedStateWithoutDiscountTwoItems)).toEqual(expectedDataVolumeB);
            });
        });

        describe('should fall back to data volume without discounts', () => {
            it('should return correctly when there is only one item', () => {
                expect(selectDataVolume(mockedStateWithoutDiscountOneItem)).toEqual(expectedDataVolumeA);
            });

            it('should return object with runtimestart=1', () => {
                expect(selectDataVolume(mockedStateWithoutDiscountTwoItems)).toEqual(expectedDataVolumeB);
            });
        });
    });

    describe('selectEndDataVolume', () => {
        it('should return null when there is no offer', () => {
            expect(selectEndDataVolume(mockedStateWithNull)).toBeNull();
        });

        describe('should return discounted data volume first', () => {
            it('should return correctly when there is only one item', () => {
                expect(selectEndDataVolume(mockedStateWithOneItemDiscount)).toEqual(expectedDataVolumeA);
            });

            it('should return object with runtimeend=24', () => {
                const expected = {
                    value: 20,
                    recurrenceStart: 7,
                    recurrenceEnd: 24,
                };

                const mockedState: RootState = {
                    [tariffSlice.name]: {
                        subscriptionId: RED_M_VIRTUAL_ID,
                    },
                    [optionsSlice.name]: {
                        atomicId: '1234',
                    },
                    [appSlice.name]: {
                        salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
                        isTradeIn: true,
                    },
                    [gladosApi.reducerPath]: {
                        queries: {
                            [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                                status: QueryStatus.fulfilled,
                                data: {
                                    data: [
                                        {
                                            hardware: {
                                                hardwareId: '1234',
                                            },
                                            tariffs: [
                                                {
                                                    virtualItemId: RED_M_VIRTUAL_ID,
                                                    dataVolume: {
                                                        withDiscounts: [
                                                            expected,
                                                            {
                                                                unit: 'GB',
                                                                unlimited: false,
                                                                value: 10,
                                                                recurrenceEnd: 6,
                                                                recurrenceStart: 1,
                                                            },
                                                        ],
                                                        withoutDiscounts: {
                                                            recurrenceStart: 1,
                                                            recurrenceEnd: 24,
                                                            unit: 'GB',
                                                            unlimited: false,
                                                            value: 30,
                                                        },
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    },
                } as RootState;

                expect(selectEndDataVolume(mockedState)).toEqual(expected);
            });
        });

        describe('should fall back to data volume without discounts', () => {
            it('should return correctly when there is only one item', () => {
                expect(selectEndDataVolume(mockedStateWithoutDiscountOneItem)).toEqual(expectedDataVolumeA);
            });

            it('should return object with runtimeend=24', () => {
                const expected = {
                    value: 20,
                    recurrenceStart: 7,
                    recurrenceEnd: 24,
                    unit: 'GB',
                    unlimited: false,
                };
                const mockedState: RootState = {
                    [tariffSlice.name]: {
                        subscriptionId: RED_M_VIRTUAL_ID,
                    },
                    [optionsSlice.name]: {
                        atomicId: '1234',
                    },
                    [appSlice.name]: {
                        salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
                        isTradeIn: true,
                    },
                    [gladosApi.reducerPath]: {
                        queries: {
                            [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                                status: QueryStatus.fulfilled,
                                data: {
                                    data: [
                                        {
                                            hardware: {
                                                hardwareId: '1234',
                                            },
                                            tariffs: [
                                                {
                                                    virtualItemId: RED_M_VIRTUAL_ID,
                                                    dataVolume: {
                                                        withoutDiscounts:
                                                            expected,
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    },
                } as RootState;

                expect(selectEndDataVolume(mockedState)).toEqual(expected);
            });
        });
    });

    describe('selectStairway', () => {
        describe('should return false', () => {
            it('when there are no offers', () => {
                expect(selectStairway(mockedStateWithNull)).toBe(false);
            });

            it('when end tariff and tariff price are equal (just one item)', () => {
                const mockedState: RootState = {
                    [tariffSlice.name]: {
                        subscriptionId: RED_M_VIRTUAL_ID,
                    },
                    [optionsSlice.name]: {
                        atomicId: '1234',
                    },
                    [appSlice.name]: {
                        salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
                        isTradeIn: true,
                    },
                    [gladosApi.reducerPath]: {
                        queries: {
                            [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                                status: QueryStatus.fulfilled,
                                data: {
                                    data: [
                                        {
                                            hardware: {
                                                hardwareId: '1234',
                                            },
                                            tariffs: [
                                                {
                                                    virtualItemId: RED_M_VIRTUAL_ID,
                                                    prices: {
                                                        [OfferType.Composition]: {
                                                            [OfferType.SimOnly]: {
                                                                [PriceType.Monthly]: {
                                                                    withDiscounts: [
                                                                        {
                                                                            gross: 10,
                                                                            recurrenceStart: 1,
                                                                            recurrenceEnd: 24,
                                                                        },
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                    },

                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    },
                } as RootState;
                expect(selectStairway(mockedState)).toBe(false);
            });
        });

        it('should return true when there is a stairway', () => {
            const mockedState: RootState = {
                [tariffSlice.name]: {
                    subscriptionId: RED_M_VIRTUAL_ID,
                },
                [optionsSlice.name]: {
                    atomicId: '1234',
                },
                [appSlice.name]: {
                    salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
                    isTradeIn: true,
                },
                [gladosApi.reducerPath]: {
                    queries: {
                        [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                            status: QueryStatus.fulfilled,
                            data: {
                                data: [
                                    {
                                        hardware: {
                                            hardwareId: '1234',
                                        },
                                        tariffs: [
                                            {
                                                virtualItemId: RED_M_VIRTUAL_ID,
                                                prices: {
                                                    [OfferType.Composition]: {
                                                        [OfferType.SimOnly]: {
                                                            [PriceType.Monthly]: {
                                                                withDiscounts: [
                                                                    {
                                                                        gross: 10,
                                                                        recurrenceEnd: 6,
                                                                        recurrenceStart: 1,
                                                                    },
                                                                    {
                                                                        gross: 20,
                                                                        recurrenceEnd: 24,
                                                                        recurrenceStart: 7,
                                                                    },
                                                                ],
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                },
            } as RootState;
            expect(selectStairway(mockedState)).toBe(true);
        });
    });

    describe('selectStrikePrice', () => {
        describe('should return null', () => {
            it('if offer has a stairway', () => {
                expect(selectStrikePrice(mockedStateWithNull)).toBeNull();
            });

            it('when there is no sales channel', () => {
                const mockedState: RootState = {
                    [appSlice.name]: {
                        salesChannel: null as unknown as SalesChannel,
                    },
                    [optionsSlice.name]: {
                        atomicId: '1234',
                    },
                } as RootState;
                expect(selectStrikePrice(mockedState)).toBeNull();
            });

            it('when there is no active offer', () => {
                expect(selectStrikePrice(mockedStateWithNull)).toBeNull();
            });

            it('if there is no discounted price', () => {
                const mockedState: RootState = {
                    [tariffSlice.name]: {
                        subscriptionId: RED_M_VIRTUAL_ID,
                    },
                    [optionsSlice.name]: {
                        atomicId: '1234',
                    },
                    [appSlice.name]: {
                        salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
                        isTradeIn: true,
                    },
                    [gladosApi.reducerPath]: {
                        queries: {
                            [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                                status: QueryStatus.fulfilled,
                                data: {
                                    data: [
                                        {
                                            hardware: {
                                                hardwareId: '1234',
                                            },
                                            tariffs: [
                                                {
                                                    virtualItemId: RED_M_VIRTUAL_ID,
                                                    prices: {
                                                        [OfferType.Composition]: {
                                                            [OfferType.SimOnly]: {
                                                                [PriceType.Monthly]: {
                                                                    withoutDiscounts: {
                                                                        gross: 10,
                                                                        recurrenceStart: 1,
                                                                        recurrenceEnd: 24,
                                                                    },
                                                                },
                                                            },
                                                            [OfferType.Insurance]: {
                                                                [PriceType.Monthly]: {},
                                                            },
                                                        },
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    },
                } as RootState;
                expect(selectStrikePrice(mockedState)).toBeNull();
            });

            it('if there is a discounted price but it is the same amount as the not discounted price', () => {
                const mockedState: RootState = {
                    [tariffSlice.name]: {
                        subscriptionId: RED_M_VIRTUAL_ID,
                    },
                    [optionsSlice.name]: {
                        atomicId: '1234',
                    },
                    [appSlice.name]: {
                        salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
                        isTradeIn: true,
                    },
                    [gladosApi.reducerPath]: {
                        queries: {
                            [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                                status: QueryStatus.fulfilled,
                                data: {
                                    data: [
                                        {
                                            hardware: {
                                                hardwareId: '1234',
                                            },
                                            tariffs: [
                                                {
                                                    virtualItemId: RED_M_VIRTUAL_ID,
                                                    prices: {
                                                        [OfferType.Composition]: {
                                                            [OfferType.SimOnly]: {
                                                                [PriceType.Monthly]: {
                                                                    withDiscounts: [{
                                                                        gross: 10,
                                                                        recurrenceStart: 1,
                                                                        recurrenceEnd: 24,
                                                                    }],
                                                                    withoutDiscounts: {
                                                                        gross: 10,
                                                                        recurrenceStart: 1,
                                                                        recurrenceEnd: 24,
                                                                    },
                                                                },
                                                            },
                                                            [OfferType.Insurance]: {
                                                                [PriceType.Monthly]: {},
                                                            },
                                                        },
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    },
                } as RootState;
                expect(selectStrikePrice(mockedState)).toBeNull();
            });
        });

        describe('should return true', () => {
            const expected = {
                gross: 20,
                recurrenceStart: 1,
                recurrenceEnd: 24,
            };

            it('when there is a discount', () => {
                const mockedState: RootState = {
                    [tariffSlice.name]: {
                        subscriptionId: RED_M_VIRTUAL_ID,
                    },
                    [optionsSlice.name]: {
                        atomicId: '1234',
                    },
                    [appSlice.name]: {
                        salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
                        isTradeIn: true,
                    },
                    [gladosApi.reducerPath]: {
                        queries: {
                            [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                                status: QueryStatus.fulfilled,
                                data: {
                                    data: [
                                        {
                                            hardware: {
                                                hardwareId: '1234',
                                            },
                                            tariffs: [
                                                {
                                                    virtualItemId: RED_M_VIRTUAL_ID,
                                                    prices: {
                                                        [OfferType.Composition]: {
                                                            [OfferType.SimOnly]: {
                                                                [PriceType.Monthly]: {
                                                                    withDiscounts: [{
                                                                        gross: 10,
                                                                        recurrenceStart: 1,
                                                                        recurrenceEnd: 24,
                                                                    }],
                                                                    withoutDiscounts: expected,
                                                                },
                                                            },
                                                            [OfferType.Insurance]: {
                                                                [PriceType.Monthly]: {},
                                                            },
                                                        },
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    },
                } as RootState;
                expect(selectStrikePrice(mockedState)).toEqual(expected);
            });
        });
    });

    describe('selectPriceToPay', () => {
        it('should return null if there is no offer', () => {
            expect(selectPriceToPay(mockedStateWithNull)).toBeNull();
        });

        it('should return tariff price', () => {
            const expected = {
                gross: 10,
                recurrenceStart: 1,
                recurrenceEnd: 24,
            };
            const mockedState: RootState = {
                [tariffSlice.name]: {
                    subscriptionId: RED_M_VIRTUAL_ID,
                },
                [optionsSlice.name]: {
                    atomicId: '1234',
                },
                [appSlice.name]: {
                    salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
                    isTradeIn: true,
                },
                [gladosApi.reducerPath]: {
                    queries: {
                        [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                            status: QueryStatus.fulfilled,
                            data: {
                                data: [
                                    {
                                        hardware: {
                                            hardwareId: '1234',
                                        },
                                        tariffs: [
                                            {
                                                virtualItemId: RED_M_VIRTUAL_ID,
                                                prices: {
                                                    [OfferType.Composition]: {
                                                        [OfferType.SimOnly]: {
                                                            [PriceType.Monthly]: {

                                                                withoutDiscounts: expected,
                                                            },
                                                        },
                                                        [OfferType.Insurance]: {
                                                            [PriceType.Monthly]: {
                                                                withoutDiscounts: {
                                                                    gross: 10,
                                                                    recurrenceStart: 1,
                                                                    recurrenceEnd: 24,
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                },
            } as RootState;

            expect(selectPriceToPay(mockedState)).toEqual(expected);
        });
    });

    describe('selectEndPriceToPay', () => {

        it('should return null if there is no offer', () => {
            expect(selectEndPriceToPay(mockedStateWithNull)).toBeNull();
        });

        it('should return end tariff price', () => {
            const expected = {
                gross: 10,
                recurrenceStart: 1,
                recurrenceEnd: 24,
            };
            const mockedState: RootState = {
                [tariffSlice.name]: {
                    subscriptionId: RED_M_VIRTUAL_ID,
                },
                [optionsSlice.name]: {
                    atomicId: '1234',
                },
                [appSlice.name]: {
                    salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
                    isTradeIn: true,
                },
                [gladosApi.reducerPath]: {
                    queries: {
                        [`${getTariffWithHardware.name}(${JSON.stringify({ isTradeIn: true, salesChannel: SALESCHANNEL_CONSUMER })})`]: {
                            status: QueryStatus.fulfilled,
                            data: {
                                data: [
                                    {
                                        hardware: {
                                            hardwareId: '1234',
                                        },
                                        tariffs: [
                                            {
                                                virtualItemId: RED_M_VIRTUAL_ID,
                                                prices: {
                                                    [OfferType.Composition]: {
                                                        [OfferType.SimOnly]: {
                                                            [PriceType.Monthly]: {
                                                                withoutDiscounts: expected,
                                                            },
                                                        },
                                                        [OfferType.Insurance]: {
                                                            [PriceType.Monthly]: {
                                                                withoutDiscounts: {
                                                                    gross: 10,
                                                                    recurrenceStart: 1,
                                                                    recurrenceEnd: 24,
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                },
            } as RootState;

            expect(selectEndPriceToPay(mockedState)).toEqual(expected);
        });
    });

    describe('selectPromotionalSummaryCardOffer', () => {
        it('should return null if there is no Giga Kombi Offer', () => {
            expect(selectPromotionalSummaryCardOffer(mockedStateWithNull).offerPrice).toBeNull();
        });

        it('should return Giga Kombi Offer price', () => {
            const expected = {
                offerPrice: 10,
            };
            const mockedState: RootState = {
                [tariffSlice.name]: {
                    subscriptionId: RED_M_VIRTUAL_ID,
                    promotionalSummaryCardOffer: expected,
                },
                [optionsSlice.name]: {
                    atomicId: '1234',
                },
            } as RootState;

            expect(selectPromotionalSummaryCardOffer(mockedState)).toEqual(expected);
        });
    });
});
