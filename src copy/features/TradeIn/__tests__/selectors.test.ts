import { RootState } from '../../../app/store';
import {
    selectState,
    selectIsLoading,
    selectHasError,
    selectTradeIn,
    selectIsTradeInSelected,
    selectTradeInInputValue,
    selectSelectedTradeInDevice,
    selectSelectedTradeInDeviceId,
    selectTradeInDevices,
    selectIsDeviceNotFound,
} from '../selectors';
import tradeInSlice from '../slice';

// Mock Device Data
const mockDevice = {
    id: '1',
    name: 'Device 1',
    maxPrice: 300,
    formattedPrice: '$300',
    imgSrc: 'img1.jpg',
};

const mockState: RootState = {
    [tradeInSlice.name]: {
        isLoading: false,
        devices: [mockDevice],
        hasError: false,
        isTradeInSelected: true,
        suggestInputValue: 'mock input',
        selectedTradeInDeviceId: '1',
        isDeviceNotFound: false,
    },
} as RootState;

const stateWithNoDevices: RootState = {
    ...mockState,
    [tradeInSlice.name]: { ...mockState[tradeInSlice.name], devices: [] },
};

const stateWithNoSelectedDeviceId: RootState = {
    ...mockState,
    [tradeInSlice.name]: { ...mockState[tradeInSlice.name], selectedTradeInDeviceId: null },
};

const stateWithUnmatchedDeviceId: RootState = {
    ...mockState,
    [tradeInSlice.name]: { ...mockState[tradeInSlice.name], selectedTradeInDeviceId: '2' },
};

const stateWithDevicesNull: RootState = {
    ...mockState,
    [tradeInSlice.name]: { ...mockState[tradeInSlice.name], devices: null },
};

const stateWithIsTradeInSelectedFalse: RootState = {
    ...mockState,
    [tradeInSlice.name]: { ...mockState[tradeInSlice.name], isTradeInSelected: false },
};

describe('tradeIn selectors', () => {
    describe('selectState', () => {
        it('should select the tradeIn state', () => {
            expect(selectState(mockState)).toEqual(mockState[tradeInSlice.name]);
        });
    });

    describe('selectIsLoading', () => {
        it('should select the isLoading state', () => {
            expect(selectIsLoading(mockState)).toEqual(false);
        });
    });

    describe('selectHasError', () => {
        it('should select the hasError state', () => {
            expect(selectHasError(mockState)).toEqual(false);
        });
    });

    describe('selectTradeIn', () => {
        it('should select the isTradeIn state', () => {
            expect(selectTradeIn(mockState)).toEqual(true);
        });

        it('should return false if isTradeInSelected is false', () => {
            expect(selectTradeIn(stateWithIsTradeInSelectedFalse)).toEqual(false);
        });

        it('should return false if selectedTradeInDeviceId is null', () => {
            expect(selectTradeIn(stateWithNoSelectedDeviceId)).toEqual(false);
        });
    });

    describe('selectIsTradeInSelected', () => {
        it('should select the isTradeInSelected state', () => {
            expect(selectIsTradeInSelected(mockState)).toEqual(true);
        });
    });

    describe('selectTradeInInputValue', () => {
        it('should select the trade-in input value', () => {
            expect(selectTradeInInputValue(mockState)).toEqual('mock input');
        });
    });

    describe('selectSelectedTradeInDeviceId', () => {
        it('should select the selected trade-in device ID', () => {
            expect(selectSelectedTradeInDeviceId(mockState)).toEqual('1');
        });
    });

    describe('selectTradeInDevices', () => {
        it('should select the trade-in devices', () => {
            expect(selectTradeInDevices(mockState)).toEqual([mockDevice]);
        });

        it('should return an empty array if devices is null', () => {
            expect(selectTradeInDevices(stateWithDevicesNull)).toEqual([]);
        });
    });

    describe('selectSelectedTradeInDevice', () => {
        it('should select the selected trade-in device', () => {
            expect(selectSelectedTradeInDevice(mockState)).toEqual(mockDevice);
        });

        it('should return null if devices are empty', () => {
            expect(selectSelectedTradeInDevice(stateWithNoDevices)).toBeNull();
        });

        it('should return null if selectedTradeInDeviceId is null', () => {
            expect(selectSelectedTradeInDevice(stateWithNoSelectedDeviceId)).toBeNull();
        });

        it('should return null if selectedTradeInDeviceId is not found', () => {
            expect(selectSelectedTradeInDevice(stateWithUnmatchedDeviceId)).toBeNull();
        });
    });

    describe('selectIsDeviceNotFound', () => {
        it('should select the isDeviceNotFound state when devices are empty', () => {
            expect(selectIsDeviceNotFound(stateWithNoDevices)).toEqual(true);
        });

        it('should select the isDeviceNotFound state when devices are not empty', () => {
            expect(selectIsDeviceNotFound(mockState)).toEqual(false);
        });
    });
});
