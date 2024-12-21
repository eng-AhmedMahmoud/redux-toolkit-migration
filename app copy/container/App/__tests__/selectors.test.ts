import {
    selectDeviceId,
    selectIsRedplusEligible,
    selectIsSimonlyEligible,
    selectIsYoungEligible,
    selectIsLoading,
    selectSalesChannel,
    selectHasError,
    selectTrackingPayload,
    selectGigakombiType,
    selectIsGigakombiEligible,
    selectIsTradeIn,
    selectIsTauschbonus,
    selectIsTauschbonusEligible,
} from '../selectors';
import {
    RED_M_VIRTUAL_ID,
    SALESCHANNEL_CONSUMER,
} from '@vfde-sails/constants';
import { RootState } from '@vfde-sails/core';
import { IInitialState } from '../interfaces/state';
import { IInitialState as IInitialStateOptions } from '../../Options/interface';
import { IInitialState as IInitialStateTariff } from '../../Tariff/interface';
import tariffSlice from '../../../container/Tariff/slice';
import optionsSlice from '../../../container/Options/slice';
import appSlice from '../slice';

describe('VVL hardwareDetail Selectors', () => {
    describe('selectIsLoading', () => {
        const isLoadingSelector = selectIsLoading();
        describe('should select the loading state', () => {
            it('should return true if some are loading', () => {
                const mockedState: RootState<Partial<IInitialState | IInitialStateOptions | IInitialStateTariff>> = {
                    [tariffSlice.name]: {
                        loading: {
                            getSubscription: false,
                        },
                    } as Partial<IInitialStateTariff>,
                    [optionsSlice.name]: {
                        loading: {
                            getDevice: true,
                        },
                    } as Partial<IInitialStateOptions>,
                    [appSlice.name]: {
                        loading: {
                            startVvlAuth: false,
                        },
                    } as Partial<IInitialState>,
                };
                expect(isLoadingSelector(mockedState as RootState<IInitialState & IInitialStateOptions & IInitialStateTariff>)).toEqual(true);
            });

            it('should return false if none are loading', () => {
                const mockedState: RootState<Partial<IInitialState | IInitialStateOptions | IInitialStateTariff>> = {
                    [tariffSlice.name]: {
                        loading: {
                            getSubscription: false,
                        },
                    } as Partial<IInitialStateTariff>,
                    [optionsSlice.name]: {
                        loading: {
                            getDevice: false,
                        },
                    } as Partial<IInitialStateOptions>,
                    [appSlice.name]: {
                        loading: {
                            startVvlAuth: false,
                        },
                    } as Partial<IInitialState>,
                };
                expect(isLoadingSelector(mockedState as RootState<IInitialState & IInitialStateOptions & IInitialStateTariff>)).toEqual(false);
            });
        });
    });

    describe('selectHasError', () => {
        const hasErrorSelector = selectHasError();
        describe('should select the error state', () => {
            it('should return true if some have error', () => {
                const mockedState: RootState<Partial<IInitialState | IInitialStateOptions | IInitialStateTariff>> = {
                    [tariffSlice.name]: {
                        errors: {
                            getSubscription: true,
                        },
                    } as Partial<IInitialStateTariff>,
                    [optionsSlice.name]: {
                        errors: {
                            getDevice: false,
                        },
                    } as Partial<IInitialStateOptions>,
                };
                expect(hasErrorSelector(mockedState as RootState<IInitialState & IInitialStateOptions & IInitialStateTariff>)).toEqual(true);
            });

            it('should return false if none have error', () => {
                const mockedState: RootState<Partial<IInitialState | IInitialStateOptions | IInitialStateTariff>> = {
                    [tariffSlice.name]: {
                        errors: {
                            getSubscription: false,
                        },
                    } as Partial<IInitialStateTariff>,
                    [optionsSlice.name]: {
                        errors: {
                            getDevice: false,
                        },
                    } as Partial<IInitialStateOptions>,
                };
                expect(hasErrorSelector(mockedState as RootState<IInitialState & IInitialStateOptions & IInitialStateTariff>)).toEqual(false);
            });
        });
    });

    describe('selectSalesChannel', () => {
        const salesChannelSelector = selectSalesChannel();
        it('should select the salesChannel state', () => {
            const mockedState = {
                [appSlice.name]: {
                    salesChannel: SALESCHANNEL_CONSUMER,
                },
            } as RootState<Partial<IInitialState>>;
            expect(salesChannelSelector(mockedState as RootState<IInitialState>)).toEqual(SALESCHANNEL_CONSUMER);
        });
    });

    describe('selectDeviceId', () => {
        const deviceIdSelector = selectDeviceId();
        it('should select the deviceId state', () => {
            const mockedState = {
                [appSlice.name]: {
                    deviceId: '1234',
                },
            } as RootState<Partial<IInitialState>>;
            expect(deviceIdSelector(mockedState as RootState<IInitialState>)).toEqual('1234');
        });
    });

    describe('selectIsSimonlyEligible', () => {
        const isSimonlyEligibleSelector = selectIsSimonlyEligible();
        const isSimonlyEligible = true;
        it('should select the isSimonlyEligible state', () => {
            const mockedState = {
                [appSlice.name]: {
                    isSimonlyEligible,
                },
            } as RootState<Partial<IInitialState>>;
            expect(isSimonlyEligibleSelector(mockedState as RootState<IInitialState>)).toEqual(isSimonlyEligible);
        });
    });

    describe('selectIsYoungEligible', () => {
        const isYoungEligibleSelector = selectIsYoungEligible();
        const isYoungEligible = true;
        it('should select the isYoungEligible state', () => {
            const mockedState = {
                [appSlice.name]: {
                    isYoungEligible,
                },
            } as RootState<Partial<IInitialState>>;
            expect(isYoungEligibleSelector(mockedState as RootState<IInitialState>)).toEqual(isYoungEligible);
        });
    });

    describe('selectIsYoungEligible', () => {
        const isGigakombiEligibleSelector = selectIsGigakombiEligible();
        const isGigakombiEligible = true;
        it('should select the isGigakombiEligible state', () => {
            const mockedState = {
                [appSlice.name]: {
                    isGigakombiEligible,
                },
            } as RootState<Partial<IInitialState>>;
            expect(isGigakombiEligibleSelector(mockedState as RootState<IInitialState>)).toEqual(isGigakombiEligible);
        });
    });

    describe('selectIsRedplusEligible', () => {
        const isRedplusEligibleSelector = selectIsRedplusEligible();
        const isRedplusEligible = true;
        it('should select the isRedplusEligible state', () => {
            const mockedState = {
                [appSlice.name]: {
                    isRedplusEligible,
                },
            } as RootState<Partial<IInitialState>>;
            expect(isRedplusEligibleSelector(mockedState as RootState<IInitialState>)).toEqual(isRedplusEligible);
        });
    });

    describe('selectIsTradeIn', () => {
        const isTradeInSelector = selectIsTradeIn();
        const isTradeIn = true;
        it('should select the isTradeIn state', () => {
            const mockedState = {
                [appSlice.name]: {
                    isTradeIn,
                },
            } as RootState<Partial<IInitialState>>;
            expect(isTradeInSelector(mockedState as RootState<IInitialState>)).toEqual(isTradeIn);
        });
    });

    describe('selectIsTauschbonus', () => {
        const isTauschbonusSelector = selectIsTauschbonus();
        const isTauschbonus = true;
        it('should select the isTauschbonus state', () => {
            const mockedState = {
                [appSlice.name]: {
                    isTauschbonus,
                },
            } as RootState<Partial<IInitialState>>;
            expect(isTauschbonusSelector(mockedState as RootState<IInitialState>)).toEqual(isTauschbonus);
        });
    });

    describe('selectIsTauschbonusEligible', () => {
        const isTauschbonusEligibleSelector = selectIsTauschbonusEligible();
        const isTauschbonusEligible = true;
        it('should select the isTauschbonusEligible state', () => {
            const mockedState = {
                [appSlice.name]: {
                    isTauschbonusEligible,
                },
            } as RootState<Partial<IInitialState>>;
            expect(isTauschbonusEligibleSelector(mockedState as RootState<IInitialState>)).toEqual(isTauschbonusEligible);
        });
    });

    describe('selectGigakombiType', () => {
        const selectGigakombiTypeSelector = selectGigakombiType();
        const gigakombiType = 'tv';
        it('should select the gigakombiType state', () => {
            const mockedState = {
                [appSlice.name]: {
                    gigakombiType,
                },
            } as RootState<Partial<IInitialState>>;
            expect(selectGigakombiTypeSelector(mockedState as RootState<IInitialState>)).toEqual(gigakombiType);
        });
    });

    describe('selectTrackingPayload', () => {
        const selector = selectTrackingPayload();

        it('should return tracking payload', () => {
            const mockedState : RootState<Partial<IInitialState | IInitialStateTariff | IInitialStateOptions>> = {
                [appSlice.name]: {
                    salesChannel: SALESCHANNEL_CONSUMER,
                } as IInitialState,
                [tariffSlice.name]: {
                    subscriptionId: RED_M_VIRTUAL_ID,
                    subscriptionPayload: null,
                } as IInitialStateTariff,
                [optionsSlice.name]: {
                    atomicId: 'foo',
                    devicePayload: {
                        data: {
                            atomics: [
                                {
                                    hardwareId: 'foo',
                                },
                            ],
                        },
                    },
                } as IInitialStateOptions,
            };
            expect(selector(mockedState as RootState<IInitialState & IInitialStateOptions & IInitialStateTariff>)).toEqual({
                salesChannel: SALESCHANNEL_CONSUMER,
                subscriptionId: RED_M_VIRTUAL_ID,
                activeOffer: null,
                atomicDevice: {
                    hardwareId: 'foo',
                },
                priceToPay: null,
            });
        });
    });
});
