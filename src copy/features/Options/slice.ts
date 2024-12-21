import {
    Capacity,
    Color,
    HardwareDetailGroupResponse,
} from '@vfde-sails/glados-v2';
import { createAppSlice } from '../../app/createAppSlice';

import { PayloadAction } from '@reduxjs/toolkit';
import { getHardwareDetailGroup } from '../../api/glados';
import { IAccordionItemProperties } from '@vfde-brix/ws10/accordion';
import { optionsState } from './interface';

/**
 * Initial state
 */
export const initialState: optionsState = {
    loading: { getHardwareDetailGroup: true },
    errors: { getHardwareDetailGroup: false },
    devicePayload: null,
    atomicId: null,
    currentColor: null,
    currentCapacity: null,
    activeAccordionItemId: null,
};

const optionsSlice = createAppSlice({
    name: 'vvlDeviceDetailsOptions',
    initialState,
    reducers: create => ({
        setDefaultState: create.reducer((state, action: PayloadAction<string | null>) => {
            state.atomicId = action.payload;
        }),
        getDevice: create.reducer(state => {
            state.loading.getHardwareDetailGroup = true;
        }),
        setDevicePayload: create.reducer((state, action: PayloadAction<HardwareDetailGroupResponse | null>) => {
            state.devicePayload = action.payload;
        }),
        changeColor: create.reducer((state, action: PayloadAction<Color['displayLabel'] | null>) => {
            const { colors } = state.devicePayload!.data;
            state.currentColor = colors.find(color => color.displayLabel === decodeURIComponent(action.payload!)) || null;
        }),
        changeCapacity: create.reducer((state, action: PayloadAction<Capacity['sortValue'] | null>) => {
            const { capacities } = state.devicePayload!.data;
            state.currentCapacity = capacities?.find(capacity => capacity.sortValue === action.payload) || null;
        }),
        setAtomicId: create.preparedReducer(
            (atomicId: string | null) => ({
                payload: {
                    atomicId,
                },
            }),
            (state, action) => {
                state.atomicId = action.payload.atomicId || null;
            },
        ),
        toggleAccordionItem: create.preparedReducer(
            (accordionItemProperties: IAccordionItemProperties) => ({
                payload: {
                    stdId: accordionItemProperties.stdId,
                    stdHeadline: accordionItemProperties.stdHeadline,
                    optOpen: accordionItemProperties.optOpen,
                },
            }),
            (state, action) => {
                state.activeAccordionItemId = action.payload.optOpen ? action.payload.stdId : null;
            },
        ),
    }),
    extraReducers: builder => {
        builder
            .addMatcher(
                getHardwareDetailGroup.matchFulfilled,
                (state, action) => {
                    state.loading.getHardwareDetailGroup = false;
                    state.errors.getHardwareDetailGroup = false;

                    const { atomics } = action.payload.data;

                    if (
                        !state.atomicId
                        || !atomics.some(atomic => atomic.hardwareId === state.atomicId)
                    ) {
                        // if user has no atomicId or any invalid atomicId
                        // find the default atomic and use its hardwareId
                        const defaultAtomic = atomics.find(atomic => atomic.defaultAtomicDevice);
                        state.atomicId = defaultAtomic?.hardwareId || null;
                    }

                    const currentAtomic = atomics.find(item => item.hardwareId === state.atomicId);

                    state.currentColor = currentAtomic?.color || null;
                    state.currentCapacity = currentAtomic?.capacity || null;
                },
            )
            .addMatcher(
                getHardwareDetailGroup.matchPending,
                state => {
                    // Handle the pending case
                    state.loading.getHardwareDetailGroup = true;
                },
            )
            .addMatcher(
                getHardwareDetailGroup.matchRejected,
                state => {
                    // Handle the failure case
                    state.loading.getHardwareDetailGroup = false;
                    state.errors.getHardwareDetailGroup = true;
                    state.currentColor = null;
                    state.currentCapacity = null;
                },
            );
    },
});

export default optionsSlice;

export const {
    setDefaultState,
    getDevice,
    setDevicePayload,
    changeColor,
    changeCapacity,
    setAtomicId,
    toggleAccordionItem,
} = optionsSlice.actions;
