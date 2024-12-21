import {
    selectIsLoading,
    selectHasError,
    selectTradeIn,
    selectIsTradeInSelected,
    selectTradeInInputValue,
    selectSelectedTradeInDevice,
    selectTradeInDevices,
    selectIsDeviceNotFound,
    selectSelectedTradeInDeviceId,
    selectState,
} from '../selectors';
import tradeInSlice from '../slice';
import { RootState } from '@vfde-sails/core';
import { IInitialState } from '../interfaces/state';
import { Device } from '../interfaces/api';

describe('vvlDeviceDetailsTradeIn Selectors', () => {
    describe('selectState', () => {

        it('should return the initial state when the slice does not exist', () => {
            const mockedState = {} as RootState<IInitialState>;
            expect(selectState(mockedState)).toEqual(tradeInSlice.getInitialState());
        });
    });

    describe('selectIsLoading', () => {
        const isLoadingSelector = selectIsLoading();
        it('should select the isLoading state', () => {
            const isLoading = true;
            const mockedState: RootState<Partial<IInitialState>> = {
                [tradeInSlice.name]: {
                    isLoading,
                },
            } as RootState<Partial<IInitialState>>;

            expect(isLoadingSelector(mockedState as RootState<IInitialState>)).toEqual(isLoading);
        });
    });

    describe('selectHasError', () => {
        const hasErrorSelector = selectHasError();
        it('should select the hasError state', () => {
            const hasError = true;
            const mockedState = {
                [tradeInSlice.name]: {
                    hasError,
                },
            } as RootState<Partial<IInitialState>>;
            expect(hasErrorSelector(mockedState as RootState<IInitialState>)).toEqual(hasError);
        });
    });

    describe('selectTradeIn', () => {
        const isTradeInSelector = selectTradeIn();
        it('should select the isTradeIn state', () => {
            const isTradeIn = true;
            const isTradeInSelected = true;
            const selectedTradeInDeviceId = '123';
            const mockedState = {
                [tradeInSlice.name]: {
                    isTradeInSelected,
                    selectedTradeInDeviceId,
                    isTradeIn,
                },
            } as RootState<Partial<IInitialState>>;
            expect(isTradeInSelector(mockedState as RootState<IInitialState>)).toEqual(isTradeIn);
        });
    });

    describe('selectIsTradeInSelected', () => {
        const isTradeInSelectedSelector = selectIsTradeInSelected();
        it('should select the isTradeInSelected state', () => {
            const isTradeInSelected = true;
            const mockedState = {
                [tradeInSlice.name]: {
                    isTradeInSelected,
                },
            } as RootState<Partial<IInitialState>>;
            expect(isTradeInSelectedSelector(mockedState as RootState<IInitialState>)).toEqual(isTradeInSelected);
        });
    });

    describe('selectTradeInInputValue', () => {
        const tradeInInputValueSelector = selectTradeInInputValue();
        it('should select the suggestInputValue state', () => {
            const suggestInputValue = 'test';
            const mockedState = {
                [tradeInSlice.name]: {
                    suggestInputValue,
                },
            } as RootState<Partial<IInitialState>>;
            expect(tradeInInputValueSelector(mockedState as RootState<IInitialState>)).toEqual(suggestInputValue);
        });
    });

    describe('selectSelectedTradeInDeviceId', () => {
        const selectedTradeInDeviceIdSelector = selectSelectedTradeInDeviceId();
        it('should select the selectedTradeInDeviceId state', () => {
            const selectedTradeInDeviceId = '1234';
            const mockedState = {
                [tradeInSlice.name]: {
                    selectedTradeInDeviceId,
                },
            } as RootState<Partial<IInitialState>>;
            expect(selectedTradeInDeviceIdSelector(mockedState as RootState<IInitialState>)).toEqual(selectedTradeInDeviceId);
        });
    });

    describe('selectTradeInDevices', () => {
        const tradeInDevicesSelector = selectTradeInDevices();
        it('should select the devices state', () => {
            const devices = null;
            const mockedState = {
                [tradeInSlice.name]: {
                    devices,
                },
            } as RootState<Partial<IInitialState>>;
            expect(tradeInDevicesSelector(mockedState as RootState<IInitialState>)).toEqual([]);
        });
    });

    describe('selectSelectedTradeInDevice', () => {
        const selectedTradeInDevicSelector = selectSelectedTradeInDevice();

        it('should return null if there where no devices', () => {
            const devices: Device[] = [];
            const selectedTradeInDeviceId = '1234';
            const mockedState: RootState<Partial<IInitialState>> = {
                [tradeInSlice.name]: {
                    devices,
                    selectedTradeInDeviceId,
                },
            };

            expect(selectedTradeInDevicSelector(mockedState as RootState<IInitialState>)).toBeNull();
        });

        it('should return null if there was no selectedTradeInDeviceId', () => {
            const devices = [{ id: '1234' }] as Device[];
            const selectedTradeInDeviceId = null;
            const mockedState: RootState<Partial<IInitialState>> = {
                [tradeInSlice.name]: {
                    devices,
                    selectedTradeInDeviceId,
                },
            };

            expect(selectedTradeInDevicSelector(mockedState as RootState<IInitialState>)).toBeNull();
        });

        it('should return null if no device found with an id equal to selectedTradeInDeviceId', () => {
            const devices = [{ id: '1234' }] as Device[];
            const selectedTradeInDeviceId = '123';
            const mockedState: RootState<Partial<IInitialState>> = {
                [tradeInSlice.name]: {
                    devices,
                    selectedTradeInDeviceId,
                },
            };

            expect(selectedTradeInDevicSelector(mockedState as RootState<IInitialState>)).toBeNull();
        });

        it('should return selected device with an id equal to selectedTradeInDeviceId', () => {
            const devices = [{ id: '1234' }] as Device[];
            const selectedTradeInDeviceId = '1234';
            const mockedState: RootState<Partial<IInitialState>> = {
                [tradeInSlice.name]: {
                    devices,
                    selectedTradeInDeviceId,
                },
            };

            expect(selectedTradeInDevicSelector(mockedState as RootState<IInitialState>)).toEqual(devices[0]);
        });
    });

    describe('selectIsDeviceNotFound', () => {
        const isDeviceNotFoundSelector = selectIsDeviceNotFound();
        it('should select the isDeviceNotFound state', () => {
            const devices: Device[] = [];
            const mockedState = {
                [tradeInSlice.name]: {
                    devices,
                },
            } as RootState<Partial<IInitialState>>;
            expect(isDeviceNotFoundSelector(mockedState as RootState<IInitialState>)).toEqual(true);
        });
    });

});
