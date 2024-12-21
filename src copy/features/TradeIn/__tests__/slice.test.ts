import tradeInSlice, {
    setDefaultState,
    setIsTradeInSelected,
    setSuggestInputValue,
    setDevices,
    setSelectedTradeInDeviceId,
    deleteSelectedTradeInDevice,
} from '../slice';
import { IInitialState } from '../interfaces/state';
import { Device } from '../interfaces/api';
import {
    getTradeInDevices,
    tradeInApi,
} from '../../../api/tradeIn';
import { configureStore } from '@reduxjs/toolkit';

// Mock Device Data
const mockDevice: Device = {
    id: '123',
    name: 'Test Device',
    maxPrice: 1000,
    formattedPrice: '$1000',
    imgSrc: 'image.jpg',
};

const mockDevices: Device[] = [mockDevice];

// Initial state for the tests
const initialState: IInitialState = {
    isLoading: false,
    devices: null,
    hasError: false,
    isTradeInSelected: false,
    suggestInputValue: '',
    selectedTradeInDeviceId: null,
    isDeviceNotFound: false,
};

// Create a store for testing extra reducers
const createStoreForTest = () => configureStore({
    reducer: {
        [tradeInApi.reducerPath]: tradeInApi.reducer,
        [tradeInSlice.reducerPath]: tradeInSlice.reducer,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(tradeInApi.middleware),
});

describe('tradeInSlice actions', () => {
    it('should create setDefaultState action', () => {
        const action = setDefaultState({ isTradeInSelected: true, selectedTradeInDevice: mockDevice });
        expect(action).toEqual({
            type: expect.any(String),
            payload: {
                isTradeInSelected: true,
                selectedTradeInDevice: mockDevice,
            },
        });
    });

    it('should create setIsTradeInSelected action', () => {
        const action = setIsTradeInSelected(true);
        expect(action).toEqual({
            type: expect.any(String),
            payload: true,
        });
    });

    it('should create setSuggestInputValue action', () => {
        const action = setSuggestInputValue('test value');
        expect(action).toEqual({
            type: expect.any(String),
            payload: 'test value',
        });
    });

    it('should create setDevices action', () => {
        const action = setDevices(mockDevices);
        expect(action).toEqual({
            type: expect.any(String),
            payload: mockDevices,
        });
    });

    it('should create setSelectedTradeInDeviceId action', () => {
        const action = setSelectedTradeInDeviceId('123');
        expect(action).toEqual({
            type: expect.any(String),
            payload: '123',
        });
    });

    it('should create deleteSelectedTradeInDevice action', () => {
        const action = deleteSelectedTradeInDevice();
        expect(action).toEqual({
            type: expect.any(String),
        });
    });
});

describe('tradeInSlice reducers', () => {
    it('should handle initial state', () => {
        expect(tradeInSlice.reducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setDefaultState', () => {
        const actual = tradeInSlice.reducer(initialState, setDefaultState({ isTradeInSelected: true, selectedTradeInDevice: mockDevice }));
        expect(actual.isTradeInSelected).toEqual(true);
        expect(actual.selectedTradeInDeviceId).toEqual('123');
        expect(actual.devices).toEqual([mockDevice]);
    });

    it('should handle setDefaultState when selectedTradeInDevice is null', () => {
        const actual = tradeInSlice.reducer(initialState, setDefaultState({
            isTradeInSelected: false,
            selectedTradeInDevice: null,
        }));
        expect(actual.isTradeInSelected).toEqual(false);
    });

    it('should handle setIsTradeInSelected', () => {
        const actual = tradeInSlice.reducer(initialState, setIsTradeInSelected(true));
        expect(actual.isTradeInSelected).toEqual(true);
    });

    it('should handle setSuggestInputValue', () => {
        const actual = tradeInSlice.reducer(initialState, setSuggestInputValue('test value'));
        expect(actual.suggestInputValue).toEqual('test value');
    });

    it('should handle setDevices', () => {
        const actual = tradeInSlice.reducer(initialState, setDevices(mockDevices));
        expect(actual.devices).toEqual(mockDevices);
    });

    it('should handle setSelectedTradeInDeviceId', () => {
        const actual = tradeInSlice.reducer(initialState, setSelectedTradeInDeviceId('123'));
        expect(actual.selectedTradeInDeviceId).toEqual('123');
    });

    it('should handle deleteSelectedTradeInDevice', () => {
        const stateWithDevice = { ...initialState, selectedTradeInDeviceId: '123' };
        const actual = tradeInSlice.reducer(stateWithDevice, deleteSelectedTradeInDevice());
        expect(actual.selectedTradeInDeviceId).toEqual(null);
    });
});

describe('tradeInSlice extraReducers', () => {
    let store: ReturnType<typeof createStoreForTest>;
    beforeEach(() => {
        store = createStoreForTest();
    });

    it('should handle tradeInApi.pending', () => {
        store.dispatch({
            type: `${tradeInApi.reducerPath}/executeQuery/pending`,
            meta: {
                arg: {
                    endpointName: getTradeInDevices.name,
                },
            },
        });

        const state = store.getState();
        expect(state[tradeInSlice.reducerPath].isLoading).toEqual(true);
        expect(state[tradeInSlice.reducerPath].hasError).toEqual(false);
    });

    it('should handle tradeInApi.fulfilled', () => {
        store.dispatch({
            type: `${tradeInApi.reducerPath}/executeQuery/fulfilled`,
            meta: {
                arg: {
                    endpointName: getTradeInDevices.name,
                },
            },
            payload: mockDevices,
        });

        const state = store.getState();
        expect(state[tradeInSlice.reducerPath].isLoading).toEqual(false);
        expect(state[tradeInSlice.reducerPath].devices).toEqual(mockDevices);
    });

    it('should set devices when selectedTradeInDeviceId is null', () => {
        store.dispatch({
            type: `${tradeInApi.reducerPath}/executeQuery/fulfilled`,
            meta: {
                arg: {
                    endpointName: getTradeInDevices.name,
                },
            },
            payload: mockDevices,
        });

        const state = store.getState();
        expect(state[tradeInSlice.reducerPath].devices).toEqual(mockDevices);
    });

    it('should not set devices when selectedTradeInDeviceId is not null', () => {
        store.dispatch({
            type: `${tradeInApi.reducerPath}/executeQuery/fulfilled`,
            meta: {
                arg: {
                    endpointName: getTradeInDevices.name,
                },
            },
            payload: mockDevices,
        });

        store.dispatch({
            type: tradeInSlice.actions.setSelectedTradeInDeviceId.type,
            payload: '123',
        });

        store.dispatch({
            type: `${tradeInApi.reducerPath}/executeQuery/fulfilled`,
            meta: {
                arg: {
                    endpointName: getTradeInDevices.name,
                },
            },
            payload: mockDevices,
        });

        const state = store.getState();
        expect(state[tradeInSlice.reducerPath].devices).toEqual(mockDevices); // Devices should not be reset
    });

    it('should handle tradeInApi.rejected', () => {
        store.dispatch({
            type: `${tradeInApi.reducerPath}/executeQuery/rejected`,
            meta: {
                arg: {
                    endpointName: getTradeInDevices.name,
                },
            },
        });

        const state = store.getState();
        expect(state[tradeInSlice.reducerPath].isLoading).toEqual(false);
        expect(state[tradeInSlice.reducerPath].hasError).toEqual(true);
        expect(state[tradeInSlice.reducerPath].devices).toEqual(null);
    });
});
