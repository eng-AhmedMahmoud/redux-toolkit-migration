import {
    RED_M_VIRTUAL_ID,
    SALESCHANNEL_CONSUMER,
    SalesChannel,
} from '@vfde-sails/constants';
import {
    selectTariffsLoadingFlag,
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
} from '../selectors';
import { IInitialState as IInitialStateTariff } from '../interface';
import { IInitialState as IInitialStateOptions } from '../../Options/interface';
import { IInitialState as IInitialStateApp } from '../../App/interfaces/state';
import { RootState } from '@vfde-sails/core';
import {
    OfferType,
    PriceType,
} from '@vfde-sails/glados-v2';
import tariffSlice from '../slice';
import optionsSlice from '../../../container/Options/slice';
import appSlice from '../../../container/App/slice';

describe('Tariff Selectors', () => {
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

    const mockedStateWithNull: RootState<Partial<IInitialStateTariff | IInitialStateOptions>> = {
        [tariffSlice.name]: {
            subscriptionPayload: null,
            promotionalSummaryCardOffer: { offerPrice: null },
        } as IInitialStateTariff,
        [optionsSlice.name]: {
            atomicId: '1234',
        } as IInitialStateOptions,
    };

    const mockedStateWithOneItemDiscount: RootState<Partial<IInitialStateTariff | IInitialStateOptions>> = {
        [tariffSlice.name]: {
            subscriptionId: RED_M_VIRTUAL_ID,
            subscriptionPayload: {
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
                        }],
                    },
                ],
            },
        } as IInitialStateTariff,
        [optionsSlice.name]: {
            atomicId: '1234',
        } as IInitialStateOptions,
    };

    const mockedStateWithTwoItemsDiscount: RootState<Partial<IInitialStateTariff | IInitialStateOptions>> = {
        [tariffSlice.name]: {
            subscriptionId: RED_M_VIRTUAL_ID,
            subscriptionPayload: {
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
        } as IInitialStateTariff,
        [optionsSlice.name]: {
            atomicId: '1234',
        } as IInitialStateOptions,
    };

    const mockedStateWithoutDiscountOneItem: RootState<Partial<IInitialStateTariff | IInitialStateOptions>> = {
        [tariffSlice.name]: {
            subscriptionId: RED_M_VIRTUAL_ID,
            subscriptionPayload: {
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
        } as IInitialStateTariff,
        [optionsSlice.name]: {
            atomicId: '1234',
        } as IInitialStateOptions,
    };

    const mockedStateWithoutDiscountTwoItems: RootState<Partial<IInitialStateTariff | IInitialStateOptions>> = {
        [tariffSlice.name]: {
            subscriptionId: RED_M_VIRTUAL_ID,
            subscriptionPayload: {
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
        } as IInitialStateTariff,
        [optionsSlice.name]: {
            atomicId: '1234',
        } as IInitialStateOptions,
    };

    const mockedStateWithNoMatchingIds: RootState<Partial<IInitialStateTariff | IInitialStateOptions>> = {
        [tariffSlice.name]: {
            subscriptionId: RED_M_VIRTUAL_ID,
            subscriptionPayload: {
                data: [
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
                ],
            },
        } as IInitialStateTariff,
        [optionsSlice.name]: {
            atomicId: '1234',
        } as IInitialStateOptions,
    };

    describe('selectState', () => {
        it('should select initialState as fallback', () => {
            const selector = selectSubscriptionId();
            expect(selector({})).toEqual(tariffSlice.getInitialState().subscriptionId);
        });
    });

    describe('selectTariffsLoadingFlag', () => {
        const isLoadingSelector = selectTariffsLoadingFlag();
        describe('should select the loading state', () => {
            it('should return true if some are loading', () => {
                const mockedState: RootState<Partial<IInitialStateTariff>> = {
                    [tariffSlice.name]: {
                        loading: {
                            getSubscription: true,
                        },
                    } as IInitialStateTariff,
                };
                expect(isLoadingSelector(mockedState as RootState<IInitialStateTariff>)).toEqual(true);
            });

            it('should return false if none are loading', () => {
                const mockedState: RootState<Partial<IInitialStateTariff>> = {
                    [tariffSlice.name]: {
                        loading: {
                            getSubscription: false,
                        },
                    } as IInitialStateTariff,
                };
                expect(isLoadingSelector(mockedState as RootState<IInitialStateTariff>)).toEqual(false);
            });
        });
    });

    describe('selectTariffsErrorsFlag', () => {
        const hasErrorSelector = selectTariffsErrorsFlag();
        describe('should select the error state', () => {
            it('should return true if some have error', () => {
                const mockedState: RootState<Partial<IInitialStateTariff>> = {
                    [tariffSlice.name]: {
                        errors: {
                            getSubscription: true,
                        },
                    } as IInitialStateTariff,
                };
                expect(hasErrorSelector(mockedState as RootState<IInitialStateTariff>)).toEqual(true);
            });

            it('should return false if none have error', () => {
                const mockedState: RootState<Partial<IInitialStateTariff>> = {
                    [tariffSlice.name]: {
                        errors: {
                            getSubscription: false,
                        },
                    } as IInitialStateTariff,
                };
                expect(hasErrorSelector(mockedState as RootState<IInitialStateTariff>)).toEqual(false);
            });
        });

    });

    describe('selectSubscriptionId', () => {
        const selector = selectSubscriptionId();

        it('should select the correct state', () => {
            const mockedState: RootState<Partial<IInitialStateTariff>> = {
                [tariffSlice.name]: {
                    subscriptionId: RED_M_VIRTUAL_ID,
                } as IInitialStateTariff,
            };

            expect(selector(mockedState as RootState<IInitialStateTariff>)).toEqual(RED_M_VIRTUAL_ID);
        });
    });

    describe('selectSubscriptionPayload', () => {
        const selector = selectSubscriptionPayload();

        it('should return null', () => {

            expect(selector(mockedStateWithNull as RootState<IInitialStateTariff>)).toBeNull();
        });
    });

    describe('selectActiveOffers', () => {
        const selector = selectActiveOffers();

        it('should return null if there are no tariffs', () => {

            expect(selector(mockedStateWithNull as RootState<IInitialStateTariff & IInitialStateOptions>)).toBeNull();
        });

        describe('with tariffs', () => {
            it('should return null if there is no match for the atomic id', () => {

                expect(selector(mockedStateWithNoMatchingIds as RootState<IInitialStateTariff & IInitialStateOptions>)).toBeNull();
            });

            it('should return filtered active offers if ids are matched', () => {

                expect(selector(mockedStateWithOneItemDiscount as RootState<IInitialStateTariff & IInitialStateOptions>)).toEqual(expectedActiveOffers);
            });
        });
    });

    describe('selectTariffPrice', () => {
        const selector = selectTariffPrice();

        it('should return null when there is no offer', () => {
            const mockedState: RootState<Partial<IInitialStateTariff | IInitialStateOptions>> = {
                [tariffSlice.name]: {
                    subscriptionPayload: null,
                } as IInitialStateTariff,
                [optionsSlice.name]: {
                    atomicId: '1234',
                } as IInitialStateOptions,
            };
            expect(selector(mockedState as RootState<IInitialStateTariff & IInitialStateOptions>)).toBeNull();
        });

        describe('should return discounted tariff price first', () => {
            it('should return correctly when there is only one item', () => {
                expect(selector(mockedStateWithOneItemDiscount as RootState<IInitialStateTariff & IInitialStateOptions>)).toEqual(expectedTariffPriceA);
            });

            it('should return object with runtimestart=1', () => {
                expect(selector(mockedStateWithTwoItemsDiscount as RootState<IInitialStateTariff & IInitialStateOptions>)).toEqual(expectedTariffPriceB);
            });
        });

        describe('should fall back to tariff price without discounts', () => {

            it('should return correctly when there is only one item', () => {
                expect(selector(mockedStateWithoutDiscountOneItem as RootState<IInitialStateTariff & IInitialStateOptions>)).toEqual(expectedTariffPriceA);
            });

            it('should return object with runtimestart=1', () => {
                expect(selector(mockedStateWithoutDiscountTwoItems as RootState<IInitialStateTariff & IInitialStateOptions>)).toEqual(expectedTariffPriceB);
            });
        });
    });

    describe('selectTariffPriceWithoutDiscounts', () => {
        const selector = selectTariffPriceWithoutDiscounts();

        it('should return null when there is no offer', () => {
            const mockedState: RootState<Partial<IInitialStateTariff | IInitialStateOptions>> = {
                [tariffSlice.name]: {
                    subscriptionPayload: null,
                } as IInitialStateTariff,
                [optionsSlice.name]: {
                    atomicId: '1234',
                } as IInitialStateOptions,
            };
            expect(selector(mockedState as RootState<IInitialStateTariff & IInitialStateOptions>)).toBeNull();
        });

        describe('should return tariff price without discount', () => {
            it('should return correctly when there is only one item', () => {
                expect(selector(mockedStateWithoutDiscountOneItem as RootState<IInitialStateTariff & IInitialStateOptions>)).toEqual(expectedTariffPriceA);
            });

            it('should return object with runtimestart=1', () => {
                expect(selector(mockedStateWithoutDiscountTwoItems as RootState<IInitialStateTariff & IInitialStateOptions>)).toEqual(expectedTariffPriceB);
            });
        });
    });

    describe('selectTariffPrice', () => {
        const selector = selectActiveOffer();

        describe('should return null', () => {
            it('when there is no offer', () => {
                const mockedState: RootState<Partial<IInitialStateTariff | IInitialStateOptions>> = {
                    [tariffSlice.name]: {
                        subscriptionId: RED_M_VIRTUAL_ID,
                        subscriptionPayload: null,
                    } as IInitialStateTariff,
                    [optionsSlice.name]: {
                        atomicId: '1234',
                    } as IInitialStateOptions,
                };
                expect(selector(mockedState as RootState<IInitialStateTariff & IInitialStateOptions>)).toBeNull();
            });

            it('when there is no atomicId', () => {
                const mockedState: RootState<Partial<IInitialStateTariff | IInitialStateOptions>> = {
                    [tariffSlice.name]: {
                        subscriptionId: RED_M_VIRTUAL_ID,
                        subscriptionPayload: {
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
                    } as IInitialStateTariff,
                    [optionsSlice.name]: {
                        atomicId: null,
                    } as IInitialStateOptions,
                };
                expect(selector(mockedState as RootState<IInitialStateTariff & IInitialStateOptions>)).toBeNull();
            });

            it('when there is no subscrptionId', () => {
                const mockedState: RootState<Partial<IInitialStateTariff | IInitialStateOptions>> = {
                    [tariffSlice.name]: {
                        subscriptionId: null,
                        subscriptionPayload: {
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
                    } as IInitialStateTariff,
                    [optionsSlice.name]: {
                        atomicId: '1234',
                    } as IInitialStateOptions,
                };
                expect(selector(mockedState as RootState<IInitialStateTariff & IInitialStateOptions>)).toBeNull();
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
            const mockedState: RootState<Partial<IInitialStateTariff | IInitialStateOptions>> = {
                [tariffSlice.name]: {
                    subscriptionId: RED_M_VIRTUAL_ID,
                    subscriptionPayload: {
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
                } as IInitialStateTariff,
                [optionsSlice.name]: {
                    atomicId: '1234',
                } as IInitialStateOptions,
            };
            expect(selector(mockedState as RootState<IInitialStateTariff & IInitialStateOptions>)).toEqual(expected);
        });

    });

    describe('selectEndTariffPrice', () => {
        const selector = selectEndTariffPrice();

        it('should return null when there is no offer', () => {
            expect(selector(mockedStateWithNull as RootState<IInitialStateTariff & IInitialStateOptions>)).toBeNull();
        });

        describe('should return discounted tariff price first', () => {
            it('should return correctly when there is only one item', () => {
                expect(selector(mockedStateWithOneItemDiscount as RootState<IInitialStateTariff & IInitialStateOptions>)).toEqual(expectedTariffPriceA);
            });

            it('should return object with runtimeend=24', () => {
                const expected = {
                    gross: 20,
                    recurrenceStart: 7,
                    recurrenceEnd: 24,
                };

                const mockedState: RootState<Partial<IInitialStateTariff | IInitialStateOptions>> = {
                    [tariffSlice.name]: {
                        subscriptionId: RED_M_VIRTUAL_ID,
                        subscriptionPayload: {
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
                    } as IInitialStateTariff,
                    [optionsSlice.name]: {
                        atomicId: '1234',
                    } as IInitialStateOptions,
                };

                expect(selector(mockedState as RootState<IInitialStateTariff & IInitialStateOptions>)).toEqual(expected);
            });
        });

        describe('should fall back to tariff price without discounts', () => {
            it('should return correctly when there is only one item', () => {
                expect(selector(mockedStateWithOneItemDiscount as RootState<IInitialStateTariff & IInitialStateOptions>)).toEqual(expectedTariffPriceA);
            });

            it('should return object with runtimeend=24', () => {
                const expected = {
                    gross: 20,
                    recurrenceStart: 7,
                    recurrenceEnd: 24,
                };
                const mockedState: RootState<Partial<IInitialStateTariff | IInitialStateOptions>> = {
                    [tariffSlice.name]: {
                        subscriptionId: RED_M_VIRTUAL_ID,
                        subscriptionPayload: {
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
                    } as IInitialStateTariff,
                    [optionsSlice.name]: {
                        atomicId: '1234',
                    } as IInitialStateOptions,
                };

                expect(selector(mockedState as RootState<IInitialStateTariff & IInitialStateOptions>)).toEqual(expected);
            });
        });
    });

    describe('selectDataVolume', () => {
        const selector = selectDataVolume();

        it('should return null when there is no offer', () => {
            expect(selector(mockedStateWithNull as RootState<IInitialStateTariff & IInitialStateOptions>)).toBeNull();
        });

        describe('should return discounted data volume first', () => {
            it('should return correctly when there is only one item', () => {
                expect(selector(mockedStateWithOneItemDiscount as RootState<IInitialStateTariff & IInitialStateOptions>)).toEqual(expectedDataVolumeA);
            });

            it('should return object with runtimestart=1', () => {
                expect(selector(mockedStateWithoutDiscountTwoItems as RootState<IInitialStateTariff & IInitialStateOptions>)).toEqual(expectedDataVolumeB);
            });
        });

        describe('should fall back to data volume without discounts', () => {
            it('should return correctly when there is only one item', () => {
                expect(selector(mockedStateWithoutDiscountOneItem as RootState<IInitialStateTariff & IInitialStateOptions>)).toEqual(expectedDataVolumeA);
            });

            it('should return object with runtimestart=1', () => {
                expect(selector(mockedStateWithoutDiscountTwoItems as RootState<IInitialStateTariff & IInitialStateOptions>)).toEqual(expectedDataVolumeB);
            });
        });
    });

    describe('selectEndDataVolume', () => {
        const selector = selectEndDataVolume();

        it('should return null when there is no offer', () => {
            expect(selector(mockedStateWithNull as RootState<IInitialStateTariff & IInitialStateOptions>)).toBeNull();
        });

        describe('should return discounted data volume first', () => {
            it('should return correctly when there is only one item', () => {
                expect(selector(mockedStateWithOneItemDiscount as RootState<IInitialStateTariff & IInitialStateOptions>)).toEqual(expectedDataVolumeA);
            });

            it('should return object with runtimeend=24', () => {
                const expected = {
                    value: 20,
                    recurrenceStart: 7,
                    recurrenceEnd: 24,
                };

                const mockedState: RootState<Partial<IInitialStateTariff | IInitialStateOptions>> = {
                    [tariffSlice.name]: {
                        subscriptionId: RED_M_VIRTUAL_ID,
                        subscriptionPayload: {
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
                    } as IInitialStateTariff,
                    [optionsSlice.name]: {
                        atomicId: '1234',
                    } as IInitialStateOptions,
                };

                expect(selector(mockedState as RootState<IInitialStateTariff & IInitialStateOptions>)).toEqual(expected);
            });
        });

        describe('should fall back to data volume without discounts', () => {
            it('should return correctly when there is only one item', () => {
                expect(selector(mockedStateWithoutDiscountOneItem as RootState<IInitialStateTariff & IInitialStateOptions>)).toEqual(expectedDataVolumeA);
            });

            it('should return object with runtimeend=24', () => {
                const expected = {
                    value: 20,
                    recurrenceStart: 7,
                    recurrenceEnd: 24,
                    unit: 'GB',
                    unlimited: false,
                };
                const mockedState: RootState<Partial<IInitialStateTariff | IInitialStateOptions>> = {
                    [tariffSlice.name]: {
                        subscriptionId: RED_M_VIRTUAL_ID,
                        subscriptionPayload: {
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
                    } as IInitialStateTariff,
                    [optionsSlice.name]: {
                        atomicId: '1234',
                    } as IInitialStateOptions,
                };

                expect(selector(mockedState as RootState<IInitialStateTariff & IInitialStateOptions>)).toEqual(expected);
            });
        });
    });

    describe('selectStairway', () => {
        const selector = selectStairway();

        describe('should return false', () => {
            it('when there are no offers', () => {
                expect(selector(mockedStateWithNull as RootState<IInitialStateTariff & IInitialStateOptions>)).toBe(false);
            });

            it('when end tariff and tariff price are equal (just one item)', () => {
                const mockedState: RootState<Partial<IInitialStateTariff | IInitialStateOptions>> = {
                    [tariffSlice.name]: {
                        subscriptionId: RED_M_VIRTUAL_ID,
                        subscriptionPayload: {
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
                    } as IInitialStateTariff,
                    [optionsSlice.name]: {
                        atomicId: '1234',
                    } as IInitialStateOptions,
                };
                expect(selector(mockedState as RootState<IInitialStateTariff & IInitialStateOptions>)).toBe(false);
            });
        });

        it('should return true when there is a stairway', () => {
            const mockedState: RootState<Partial<IInitialStateTariff | IInitialStateOptions>> = {
                [tariffSlice.name]: {
                    subscriptionId: RED_M_VIRTUAL_ID,
                    subscriptionPayload: {
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
                } as IInitialStateTariff,
                [optionsSlice.name]: {
                    atomicId: '1234',
                } as IInitialStateOptions,
            };
            expect(selector(mockedState as RootState<IInitialStateTariff & IInitialStateOptions>)).toBe(true);
        });
    });

    describe('selectStrikePrice', () => {
        const selector = selectStrikePrice();

        describe('should return null', () => {
            it('if offer has a stairway', () => {
                expect(selector(mockedStateWithNull as RootState<IInitialStateTariff & IInitialStateOptions & IInitialStateApp>)).toBeNull();
            });

            it('when there is no sales channel', () => {
                const mockedState: RootState<Partial<IInitialStateTariff | IInitialStateApp>> = {
                    [appSlice.name]: {
                        salesChannel: null as unknown as SalesChannel,
                    } as IInitialStateApp,
                };
                expect(selector(mockedState as RootState<IInitialStateTariff & IInitialStateOptions & IInitialStateApp>)).toBeNull();
            });

            it('when there is no active offer', () => {
                const mockedState: RootState<Partial<IInitialStateTariff | IInitialStateApp>> = {
                    [tariffSlice.name]: {
                        subscriptionPayload: null,
                    } as IInitialStateTariff,
                    [appSlice.name]: {
                        salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
                    } as IInitialStateApp,
                };
                expect(selector(mockedState as RootState<IInitialStateTariff & IInitialStateOptions & IInitialStateApp>)).toBeNull();
            });

            it('if there is no discounted price', () => {
                const mockedState: RootState<Partial<IInitialStateTariff | IInitialStateOptions | IInitialStateApp>> = {
                    [tariffSlice.name]: {
                        subscriptionId: RED_M_VIRTUAL_ID,
                        subscriptionPayload: {
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
                    } as IInitialStateTariff,
                    [optionsSlice.name]: {
                        atomicId: '1234',
                    } as IInitialStateOptions,
                    [appSlice.name]: {
                        salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
                    } as unknown as IInitialStateApp,
                };
                expect(selector(mockedState as RootState<IInitialStateTariff & IInitialStateOptions & IInitialStateApp>)).toBeNull();
            });

            it('if there is a discounted price but it is the same amount as the not discounted price', () => {
                const mockedState: RootState<Partial<IInitialStateTariff | IInitialStateOptions | IInitialStateApp>> = {
                    [tariffSlice.name]: {
                        subscriptionId: RED_M_VIRTUAL_ID,
                        subscriptionPayload: {
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
                    } as IInitialStateTariff,
                    [optionsSlice.name]: {
                        atomicId: '1234',
                    } as IInitialStateOptions,
                    [appSlice.name]: {
                        salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
                    } as unknown as IInitialStateApp,
                };
                expect(selector(mockedState as RootState<IInitialStateTariff & IInitialStateOptions & IInitialStateApp>)).toBeNull();
            });
        });

        describe('should return true', () => {
            const expected = {
                gross: 20,
                recurrenceStart: 1,
                recurrenceEnd: 24,
            };

            it('when there is a discount', () => {
                const mockedState: RootState<Partial<IInitialStateTariff | IInitialStateOptions | IInitialStateApp>> = {
                    [tariffSlice.name]: {
                        subscriptionId: RED_M_VIRTUAL_ID,
                        subscriptionPayload: {
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
                    } as IInitialStateTariff,
                    [optionsSlice.name]: {
                        atomicId: '1234',
                    } as IInitialStateOptions,
                    [appSlice.name]: {
                        salesChannel: SALESCHANNEL_CONSUMER as SalesChannel,
                    } as unknown as IInitialStateApp,
                };
                expect(selector(mockedState as RootState<IInitialStateTariff & IInitialStateOptions & IInitialStateApp>)).toEqual(expected);
            });
        });
    });

    describe('selectPriceToPay', () => {
        const selector = selectPriceToPay();

        it('should return null if there is no offer', () => {
            expect(selector(mockedStateWithNull as RootState<IInitialStateTariff & IInitialStateOptions>)).toBeNull();
        });

        it('should return tariff price', () => {
            const expected = {
                gross: 10,
                recurrenceStart: 1,
                recurrenceEnd: 24,
            };
            const mockedState: RootState<Partial<IInitialStateTariff | IInitialStateOptions>> = {
                [tariffSlice.name]: {
                    subscriptionId: RED_M_VIRTUAL_ID,
                    subscriptionPayload: {
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
                } as IInitialStateTariff,
                [optionsSlice.name]: {
                    atomicId: '1234',
                } as IInitialStateOptions,
            };

            expect(selector(mockedState as RootState<IInitialStateTariff & IInitialStateOptions>)).toEqual(expected);
        });
    });

    describe('selectEndPriceToPay', () => {
        const selector = selectEndPriceToPay();

        it('should return null if there is no offer', () => {
            expect(selector(mockedStateWithNull as RootState<IInitialStateTariff & IInitialStateOptions>)).toBeNull();
        });

        it('should return end tariff price', () => {
            const expected = {
                gross: 10,
                recurrenceStart: 1,
                recurrenceEnd: 24,
            };
            const mockedState: RootState<Partial<IInitialStateTariff | IInitialStateOptions>> = {
                [tariffSlice.name]: {
                    subscriptionId: RED_M_VIRTUAL_ID,
                    subscriptionPayload: {
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
                } as IInitialStateTariff,
                [optionsSlice.name]: {
                    atomicId: '1234',
                } as IInitialStateOptions,
            };

            expect(selector(mockedState as RootState<IInitialStateTariff & IInitialStateOptions>)).toEqual(expected);
        });
    });

    describe('selectPromotionalSummaryCardOffer', () => {
        const selector = selectPromotionalSummaryCardOffer();

        it('should return null if there is no Giga Kombi Offer', () => {
            expect(selector(mockedStateWithNull as RootState<IInitialStateTariff & IInitialStateOptions>).offerPrice).toBeNull();
        });

        it('should return Giga Kombi Offer price', () => {
            const expected = {
                offerPrice: 10,
            };
            const mockedState: RootState<Partial<IInitialStateTariff | IInitialStateOptions>> = {
                [tariffSlice.name]: {
                    subscriptionId: RED_M_VIRTUAL_ID,
                    promotionalSummaryCardOffer: expected,
                } as IInitialStateTariff,
                [optionsSlice.name]: {
                    atomicId: '1234',
                } as IInitialStateOptions,
            };

            expect(selector(mockedState as RootState<IInitialStateTariff & IInitialStateOptions>)).toEqual(expected);
        });
    });

});
