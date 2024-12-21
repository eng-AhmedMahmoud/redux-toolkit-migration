import tradeInSlice, {
    setIsTradeInSelected,
    setDefaultState,
    initialState,
    getTradeInDevices,
    getTradeInDevicesFailed,
    getTradeInDevicesSuccess,
    setSuggestInputValue,
    setSelectedTradeInDeviceId,
    deleteSelectedTradeInDevice,
} from '../slice';
import produce from 'immer';
import { Device } from '../interfaces/api';
import { CONTAINER_TRADE_IN } from 'Constant';

describe('VVL Device Details App Slice', () => {
    describe('Actions', () => {
        describe('setDefaultState', () => {
            it('should return the correct type', () => {
                const isTradeInSelected = true;
                const selectedTradeInDevice = null;

                const payload = {
                    isTradeInSelected,
                    selectedTradeInDevice,
                };
                const expected = {
                    type: expect.any(String),
                    payload,
                };

                expect(
                    setDefaultState(isTradeInSelected, selectedTradeInDevice),
                ).toEqual(expected);
            });
        });

        describe('setIsTradeInSelected', () => {
            it('should return the correct type', () => {
                const isTradeInSelected = true;

                const expected = {
                    type: expect.any(String),
                    payload: isTradeInSelected,
                };

                expect(setIsTradeInSelected(isTradeInSelected)).toEqual(
                    expected,
                );
            });
        });
        describe('getTradeInDevices', () => {
            it('should return the correct type', () => {
                const expected = {
                    type: expect.any(String),
                };

                expect(getTradeInDevices()).toEqual(expected);
            });
        });
        describe('getTradeInDevicesSuccess', () => {
            it('should return the correct type', () => {
                const devices: Device[] = [];
                const expected = {
                    type: expect.any(String),
                    payload: devices,
                };

                expect(getTradeInDevicesSuccess(devices)).toEqual(expected);
            });
        });

        describe('getTradeInDevicesFailed', () => {
            it('should return the correct type', () => {
                const expected = {
                    type: expect.any(String),
                };

                expect(getTradeInDevicesFailed()).toEqual(expected);
            });
        });
        describe('setSuggestInputValue', () => {
            it('should return the correct type', () => {
                const value = 'iphone';
                const expected = {
                    type: expect.any(String),
                    payload: value,
                };

                expect(setSuggestInputValue(value)).toEqual(expected);
            });
        });
        describe('setSelectedTradeInDeviceId', () => {
            it('should return the correct type', () => {
                const selectedTradeInDeviceId = '123';
                const expected = {
                    type: expect.any(String),
                    payload: selectedTradeInDeviceId,
                };

                expect(setSelectedTradeInDeviceId(selectedTradeInDeviceId)).toEqual(expected);
            });
        });
        describe('deleteSelectedTradeInDevice', () => {
            it('should return the correct type', () => {
                const expected = {
                    type: `${CONTAINER_TRADE_IN}/deleteSelectedTradeInDevice`,
                };

                expect(deleteSelectedTradeInDevice()).toEqual(expected);
            });
        });

    });

    describe('Reducer', () => {
        it('should return the init reducer state', () => {
            expect(tradeInSlice.reducer(undefined, {} as any)).toEqual(
                initialState,
            );
        });

        it('should return the init initialState', () => {
            expect(tradeInSlice.reducer(initialState, {} as any)).toEqual(
                initialState,
            );
        });

        describe('setDefaultState action', () => {
            it('should handle the setDefaultState action correctly with selectedTradeInDevice', () => {
                const isTradeInSelected = true;
                const selectedTradeInDevice = { id: '1234' } as Device;

                const expected = produce(initialState, draft => {
                    draft.isTradeInSelected = isTradeInSelected;
                    draft.selectedTradeInDeviceId = selectedTradeInDevice.id;
                    draft.devices = [selectedTradeInDevice];
                });
                expect(
                    tradeInSlice.reducer(
                        initialState,
                        setDefaultState(
                            isTradeInSelected,
                            selectedTradeInDevice,
                        ),
                    ),
                ).toEqual(expected);
            });

            it('should handle the setDefaultState action correctly with no selectedTradeInDevice', () => {
                const isTradeInSelected = true;
                const selectedTradeInDevice = null;

                const expected = produce(initialState, draft => {
                    draft.isTradeInSelected = false;
                });
                expect(
                    tradeInSlice.reducer(
                        initialState,
                        setDefaultState(
                            isTradeInSelected,
                            selectedTradeInDevice,
                        ),
                    ),
                ).toEqual(expected);
            });
        });

        it('should handle the setIsTradeInSelected action correctly', () => {
            const isTradeInSelected = true;

            const expected = produce(initialState, draft => {
                draft.isTradeInSelected = isTradeInSelected;
            });
            expect(
                tradeInSlice.reducer(
                    initialState,
                    setIsTradeInSelected(isTradeInSelected),
                ),
            ).toEqual(expected);
        });
        it('should handle the getTradeInDevices action correctly', () => {
            const expected = produce(tradeInSlice.getInitialState(), draft => {
                draft.isLoading = true;
            });

            expect(tradeInSlice.reducer(tradeInSlice.getInitialState(), getTradeInDevices())).toEqual(expected);
        });

        describe('should handle the getTradeInDevicesSuccess action correctly', () => {
            it('without selectedTradeInDeviceId', () => {
                const devices = ['foo'] as unknown as Device[];
                const expected = produce(tradeInSlice.getInitialState(), draft => {
                    draft.devices = devices;
                    draft.isLoading = false;
                    draft.hasError = false;
                });

                expect(
                    tradeInSlice.reducer(
                        tradeInSlice.getInitialState(),
                        getTradeInDevicesSuccess(devices),
                    ),
                ).toEqual(expected);
            });

            it('with selectedTradeInDeviceId', () => {
                const devicesForState = ['foo'] as unknown as Device[];
                const devicesForAction = ['bar'] as unknown as Device[];
                const expected = produce(tradeInSlice.getInitialState(), draft => {
                    draft.selectedTradeInDeviceId = 'foobar';
                    draft.devices = devicesForState;
                    draft.isLoading = false;
                    draft.hasError = false;
                });

                expect(
                    tradeInSlice.reducer(
                        {
                            ...tradeInSlice.getInitialState(),
                            selectedTradeInDeviceId: 'foobar',
                            devices: devicesForState,
                        },
                        getTradeInDevicesSuccess(devicesForAction),
                    ),
                ).toEqual(expected);
            });
        });

        it('should handle the getTradeInDevicesFailed action correctly', () => {
            const expected = produce(tradeInSlice.getInitialState(), draft => {
                draft.hasError = true;
            });

            expect(tradeInSlice.reducer(tradeInSlice.getInitialState(), getTradeInDevicesFailed())).toEqual(expected);
        });

        it('should handle the setSuggestInputValue action correctly', () => {
            const suggestInputValue = 'iphone';
            const expected = produce(tradeInSlice.getInitialState(), draft => {
                draft.suggestInputValue = suggestInputValue;
            });

            expect(tradeInSlice.reducer(tradeInSlice.getInitialState(), setSuggestInputValue(suggestInputValue))).toEqual(expected);
        });

        it('should handle the setIsTradeInSelected action correctly', () => {
            const expected = produce(tradeInSlice.getInitialState(), draft => {
                draft.isTradeInSelected = false;
            });

            expect(tradeInSlice.reducer(tradeInSlice.getInitialState(), setIsTradeInSelected(false))).toEqual(expected);
        });

        it('should handle the setSelectedTradeInDeviceId action correctly', () => {
            const selectedTradeInDeviceId = '123';
            const expected = produce(tradeInSlice.getInitialState(), draft => {
                draft.selectedTradeInDeviceId = selectedTradeInDeviceId;
            });

            expect(
                tradeInSlice.reducer(
                    tradeInSlice.getInitialState(),
                    setSelectedTradeInDeviceId(selectedTradeInDeviceId),
                ),
            ).toEqual(expected);
        });
        it('should handle the deleteSelectedTradeInDevice action correctly', () => {
            const selectedTradeInDeviceId = null;
            const expected = produce(tradeInSlice.getInitialState(), draft => {
                draft.selectedTradeInDeviceId = selectedTradeInDeviceId;
            });

            expect(tradeInSlice.reducer(tradeInSlice.getInitialState(), deleteSelectedTradeInDevice())).toEqual(expected);
        });
    });
});
