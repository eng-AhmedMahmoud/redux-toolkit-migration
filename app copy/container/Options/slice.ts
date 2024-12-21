import {
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import {
    IInitialState,
    StateProps,
} from './interface';
import {
    Color,
    HardwareDetailGroupResponse,
} from '@vfde-sails/glados-v2';
import { appActionDispatchers } from '../App/slice';

/**
 * Initial state
 */
const initialState: IInitialState = {
    loading: {
        getDevice: true,
    },
    errors: {
        getDevice: false,
    },
    currentColor: null,
    currentCapacity: null,
    atomicId: null,
    devicePayload: null,
};

const optionsSlice = createSlice({
    name: 'vvlDeviceDetailsOptions',
    initialState,
    reducers: {
        setDefaultState: (state, action: PayloadAction<StateProps['atomicId']>) => {
            state.atomicId = action.payload;
        },
        getDevice: state => {
            state.loading.getDevice = true;
        },
        getDeviceSuccess: (state, action: PayloadAction<HardwareDetailGroupResponse>) => {
            state.loading.getDevice = false;
            state.errors.getDevice = false;
            state.devicePayload = action.payload;

            const { atomics } = action.payload.data;

            if (
                !state.atomicId
                || !atomics.some(atomic => atomic.hardwareId === state.atomicId)
            ) {
                // if user has no customerConfig or no atomicId or any invalid atomicId
                // find the default atomic and use its hardwareId
                const defaultAtomic = atomics.find(atomic => atomic.defaultAtomicDevice);
                state.atomicId = defaultAtomic?.hardwareId || null;
            }

            const currentAtomic = atomics.find(item => item.hardwareId === state.atomicId);

            state.currentColor = currentAtomic?.color || null;
            state.currentCapacity = currentAtomic?.capacity || null;
        },
        getDeviceFailed: state => {
            state.loading.getDevice = false;
            state.errors.getDevice = true;
        },
        changeColor: (state, action: PayloadAction<Color['displayLabel']>) => {
            const { colors } = state.devicePayload!.data;
            state.currentColor = colors.find(color => color.displayLabel === decodeURIComponent(action.payload)) || null;
        },
        changeCapacity: (state, action: PayloadAction<number>) => {
            const { capacities } = state.devicePayload!.data;
            state.currentCapacity = capacities?.find(capacity => capacity.sortValue === action.payload) || null;
        },
        setAtomicId: {
            reducer: (draft, action: PayloadAction<{ atomicId: string }>) => {
                draft.atomicId = action.payload.atomicId;
            },
            prepare: (atomicId: string) => ({
                payload: {
                    atomicId,
                },
            }),
        },
    },
});

export default optionsSlice;

export const {
    setDefaultState,
    getDevice,
    getDeviceSuccess,
    getDeviceFailed,
    changeColor,
    changeCapacity,
    setAtomicId,
} = optionsSlice.actions;

export const optionsActionDispatchers = {
    setDefaultState,
    changeColor,
    changeCapacity,
    ...appActionDispatchers,
};

/**
 * Action Dispatchers
 */
export type OptionsActionDispatchers = typeof optionsActionDispatchers;
