import optionsSlice, {
    initialState,
    setDefaultState,
    setDevicePayload,
    changeColor,
    changeCapacity,
    setAtomicId,
    toggleAccordionItem,
    getDevice,
} from '../slice';
import {
    getHardwareDetailGroup,
    gladosApi,
} from '../../../api/glados';
import {
    Capacity,
    Color,
    HardwareDetailGroupResponse,
    Cellular,
    HardwareDetailGroupAtomic,
} from '@vfde-sails/glados-v2';
import { IAccordionItemProperties } from '@vfde-brix/ws10/accordion';
import { optionsState } from '../interface';
import produce from 'immer';

describe('VVL Device Details Options Slice', () => {
    describe('Actions', () => {

        describe('setDefaultState', () => {
            it('should return the correct type', () => {
                const fixture = '123';
                const expected = {
                    type: expect.any(String),
                    payload: fixture,
                };

                expect(setDefaultState(fixture)).toEqual(expected);
            });
        });

        describe('getDevice', () => {
            it('should return the correct type', () => {
                const expected = {
                    type: expect.any(String),
                };

                expect(getDevice()).toEqual(expected);
            });
        });

        describe('setDevicePayload', () => {
            it('should return the correct type and payload', () => {
                const mockPayload: HardwareDetailGroupResponse = {
                    data: {
                        modelName: 'Test Phone',
                        virtualItemId: 'test-id',
                        legacyGroupId: 'legacy-id',
                        promotionAttribute: { cellular: Cellular.FiveG },
                        url: { hubpage: { href: 'test-url' }, galleryImage: { href: 'test-image' } },
                        colors: [],
                        capacities: [],
                        atomics: [],
                        attributeGroups: [],
                    },
                };
                const expected = {
                    type: expect.any(String),
                    payload: mockPayload,
                };
                expect(setDevicePayload(mockPayload)).toEqual(expected);
            });
        });

        describe('changeColor', () => {
            it('should return the correct type', () => {
                const fixture = 'red';
                const expected = {
                    type: expect.any(String),
                    payload: fixture,
                };

                expect(changeColor(fixture)).toEqual(expected);
            });
        });

        describe('changeCapacity', () => {
            it('should return the correct type', () => {
                const fixture = 64;
                const expected = {
                    type: expect.any(String),
                    payload: fixture,
                };

                expect(changeCapacity(fixture)).toEqual(expected);
            });
        });

        describe('setAtomicId', () => {
            it('should return the correct type', () => {
                const fixture = '123';
                const expected = {
                    type: expect.any(String),
                    payload: {
                        atomicId: '123',
                    },
                };

                expect(setAtomicId(fixture)).toEqual(expected);
            });
        });

        describe('toggleAccordionItem', () => {
            it('should handle toggleAccordionItem when opening an item', () => {
                const accordionItem: IAccordionItemProperties = {
                    stdId: 'test-id',
                    stdHeadline: 'Test Headline',
                    optOpen: true,
                    containerAnyComponent: undefined,
                };

                // Test the action creator
                const expected = {
                    type: expect.any(String),
                    payload: {
                        stdId: accordionItem.stdId,
                        stdHeadline: accordionItem.stdHeadline,
                        optOpen: accordionItem.optOpen,
                    },
                };
                expect(toggleAccordionItem(accordionItem)).toEqual(expected);

                // Test the reducer
                const mockState = { activeAccordionItemId: null } as optionsState;
                const newState = optionsSlice.reducer(mockState, toggleAccordionItem(accordionItem));
                expect(newState.activeAccordionItemId).toBe('test-id');
            });

            it('should handle toggleAccordionItem when closing an item', () => {
                const accordionItem: IAccordionItemProperties = {
                    stdId: 'test-id',
                    stdHeadline: 'Test Headline',
                    optOpen: false,
                    containerAnyComponent: undefined,
                };

                // Test the action creator
                const expected = {
                    type: expect.any(String),
                    payload: {
                        stdId: accordionItem.stdId,
                        stdHeadline: accordionItem.stdHeadline,
                        optOpen: accordionItem.optOpen,
                    },
                };
                expect(toggleAccordionItem(accordionItem)).toEqual(expected);

                // Test the reducer
                const mockState = { activeAccordionItemId: 'test-id' } as optionsState;
                const newState = optionsSlice.reducer(mockState, toggleAccordionItem(accordionItem));
                expect(newState.activeAccordionItemId).toBeNull();
            });

            it('should set activeAccordionItemId to null when optOpen is false', () => {
                const mockState = { activeAccordionItemId: 'test-id' } as optionsState;
                const action = {
                    type: toggleAccordionItem.type,
                    payload: {
                        stdId: 'test-id',
                        stdHeadline: 'Test Headline',
                        optOpen: false,
                    },
                };

                const newState = optionsSlice.reducer(mockState, action);
                expect(newState.activeAccordionItemId).toBeNull();
            });
        });
    });

    describe('Reducer', () => {
        it('should handle the setDefaultState action correctly', () => {
            const atomicId = '1234';

            const expected = produce(optionsSlice.getInitialState(), draft => {
                draft.atomicId = atomicId;
            });
            expect(optionsSlice.reducer(optionsSlice.getInitialState(), setDefaultState(atomicId))).toEqual(expected);
        });

        it('should return the init reducer state', () => {
            expect(optionsSlice.reducer(undefined, {} as any)).toEqual(optionsSlice.getInitialState());
        });

        it('should return the init optionsSlice.getInitialState()', () => {
            expect(optionsSlice.reducer(optionsSlice.getInitialState(), {} as any)).toEqual(optionsSlice.getInitialState());
        });

        it('should handle the setAtomicId action correctly', () => {
            const fixture = '123';
            const expected = produce(optionsSlice.getInitialState(), draft => {
                draft.atomicId = fixture;
            });
            expect(optionsSlice.reducer(optionsSlice.getInitialState(), setAtomicId(fixture))).toEqual(expected);
        });

        it('should handle setDevicePayload', () => {
            const mockPayload: HardwareDetailGroupResponse = {
                data: {
                    modelName: 'Test Phone',
                    virtualItemId: 'test-id',
                    legacyGroupId: 'legacy-id',
                    promotionAttribute: { cellular: Cellular.FiveG },
                    url: { hubpage: { href: 'test-url' }, galleryImage: { href: 'test-image' } },
                    colors: [],
                    capacities: [],
                    atomics: [],
                    attributeGroups: [],
                },
            };
            const newState = optionsSlice.reducer(initialState, setDevicePayload(mockPayload));
            expect(newState.devicePayload).toEqual(mockPayload);
        });

        describe('should handle the changeColor action correctly', () => {
            it('should set the capacity to color object', () => {
                const fixture = 'bar';
                const mockState = {
                    ...optionsSlice.getInitialState(),
                    devicePayload: {
                        data: {
                            colors: [
                                {
                                    displayLabel: 'foo',
                                    primaryColorRgb: '456',
                                },
                                {
                                    displayLabel: fixture,
                                    primaryColorRgb: '123',
                                },
                            ],
                        },
                    } as HardwareDetailGroupResponse,
                };
                const expected = produce(mockState, draft => {
                    draft.currentColor = {
                        displayLabel: fixture,
                        primaryColorRgb: '123',
                    } as Color;
                });
                expect(optionsSlice.reducer(mockState, changeColor(fixture))).toEqual(expected);
            });

            it('should set to null if no matching color is found', () => {
                const fixture = 'bar';
                const mockState = {
                    ...optionsSlice.getInitialState(),
                    devicePayload: {
                        data: {
                            colors: [
                                {
                                    displayLabel: 'foo',
                                    primaryColorRgb: '456',
                                },
                                {
                                    displayLabel: 'foobar',
                                    primaryColorRgb: '123',
                                },
                            ],
                        },
                    } as HardwareDetailGroupResponse,
                };
                const expected = produce(mockState, draft => {
                    draft.currentColor = null;
                });
                expect(optionsSlice.reducer(mockState, changeColor(fixture))).toEqual(expected);
            });
        });

        describe('should handle the changeCapacity action correctly', () => {
            it('should set the capacity to capacity object', () => {
                const fixture = 123;
                const expected = produce({
                    ...optionsSlice.getInitialState(),
                    devicePayload: {
                        data: {
                            capacities: [
                                {
                                    displayLabel: 'foo',
                                    sortValue: 456,
                                },
                                {
                                    displayLabel: 'bar',
                                    sortValue: fixture,
                                },
                            ],
                        },
                    } as HardwareDetailGroupResponse,
                }, draft => {
                    draft.currentCapacity = {
                        displayLabel: 'bar',
                        sortValue: fixture,
                    } as Capacity;
                });
                expect(optionsSlice.reducer({
                    ...optionsSlice.getInitialState(),
                    devicePayload: {
                        data: {
                            capacities: [
                                {
                                    displayLabel: 'foo',
                                    sortValue: 456,
                                },
                                {
                                    displayLabel: 'bar',
                                    sortValue: fixture,
                                },
                            ],
                        },
                    } as HardwareDetailGroupResponse,
                }, changeCapacity(fixture))).toEqual(expected);
            });

            it('should set to null if no matching capacity is found', () => {
                const fixture = 789;
                const expected = produce({
                    ...optionsSlice.getInitialState(),
                    devicePayload: {
                        data: {
                            capacities: [
                                {
                                    displayLabel: 'foo',
                                    sortValue: 456,
                                },
                                {
                                    displayLabel: 'foobar',
                                    sortValue: 123,
                                },
                            ],
                        },
                    } as HardwareDetailGroupResponse,
                }, draft => {
                    draft.currentCapacity = null;
                });
                expect(optionsSlice.reducer({
                    ...optionsSlice.getInitialState(),
                    devicePayload: {
                        data: {
                            capacities: [
                                {
                                    displayLabel: 'foo',
                                    sortValue: 456,
                                },
                                {
                                    displayLabel: 'foobar',
                                    sortValue: 123,
                                },
                            ],
                        },
                    } as HardwareDetailGroupResponse,
                }, changeCapacity(fixture))).toEqual(expected);
            });
        });

        it('should handle getDevice correctly', () => {
            expect(optionsSlice.reducer(optionsSlice.getInitialState(), getDevice())).toEqual(produce(optionsSlice.getInitialState(), draft => {
                draft.loading.getHardwareDetailGroup = true;
            }));
        });

        it('should handle toggleAccordionItem', () => {
            const accordionItem: IAccordionItemProperties = {
                stdId: 'test-id',
                stdHeadline: 'Test Headline',
                optOpen: true,
                containerAnyComponent: undefined,
            };
            const newState = optionsSlice.reducer(initialState, toggleAccordionItem(accordionItem));
            expect(newState.activeAccordionItemId).toBe(accordionItem.stdId);
        });
    });
    describe('Extra Reducers', () => {
        describe('getHardwareDetailGroup.matchFulfilled', () => {
            test('no atomicId is set in the state', () => {
                const initialTestState = {
                    ...initialState,
                    atomicId: null,
                };
                const mockPayload: HardwareDetailGroupResponse = {
                    data: {
                        modelName: 'Test Phone',
                        virtualItemId: 'test-id',
                        legacyGroupId: 'legacy-id',
                        promotionAttribute: { cellular: '5G' as Cellular },
                        url: {
                            hubpage: { href: 'test-url' },
                            galleryImage: { href: 'test-image' },
                        },
                        colors: [
                            { displayLabel: 'Red', primaryColorRgb: '255,0,0' },
                            { displayLabel: 'Green', primaryColorRgb: '0,255,0' },
                        ],
                        capacities: [
                            { displayLabel: '64GB', sortValue: 64 },
                            { displayLabel: '128GB', sortValue: 128 },
                        ],
                        atomics: [
                            {
                                hardwareId: 'foo1',
                                defaultAtomicDevice: true,
                                color: {
                                    displayLabel: 'red',
                                },
                                capacity: {
                                    sortValue: 1,
                                },
                            },
                            {
                                hardwareId: 'foo2',
                                defaultAtomicDevice: false,
                                color: {
                                    displayLabel: 'green',
                                },
                                capacity: {
                                    sortValue: 2,
                                },
                            },
                        ] as HardwareDetailGroupAtomic[],
                        attributeGroups: [],
                    },
                };
                const action = {
                    type: `${gladosApi.reducerPath}/executeQuery/fulfilled`,
                    meta: {
                        arg: {
                            endpointName: getHardwareDetailGroup.name,
                            queryCacheKey: `${getHardwareDetailGroup.name}(undefined)`,
                        },
                    },
                    payload: mockPayload,
                };
                const newState = optionsSlice.reducer(initialTestState, action);
                expect(newState).toMatchObject({
                    atomicId: 'foo1',
                    currentColor: {
                        displayLabel: 'red',
                    },
                    currentCapacity: {
                        sortValue: 1,
                    },
                    loading: { getHardwareDetailGroup: false },
                    errors: { getHardwareDetailGroup: false },
                });
            });

            test('no atomic with the atomicId in the state is found', () => {
                const initialTestState = {
                    ...initialState,
                    atomicId: 'foo3',
                };
                const mockPayload: HardwareDetailGroupResponse = {
                    data: {
                        modelName: 'Test Phone',
                        virtualItemId: 'test-id',
                        legacyGroupId: 'legacy-id',
                        promotionAttribute: { cellular: '5G' as Cellular },
                        url: {
                            hubpage: { href: 'test-url' },
                            galleryImage: { href: 'test-image' },
                        },
                        colors: [
                            { displayLabel: 'Red', primaryColorRgb: '255,0,0' },
                            { displayLabel: 'Green', primaryColorRgb: '0,255,0' },
                        ],
                        capacities: [
                            { displayLabel: '64GB', sortValue: 64 },
                            { displayLabel: '128GB', sortValue: 128 },
                        ],
                        atomics: [
                            {
                                hardwareId: 'foo1',
                                defaultAtomicDevice: true,
                                color: {
                                    displayLabel: 'red',
                                },
                                capacity: {
                                    sortValue: 1,
                                },
                            },
                            {
                                hardwareId: 'foo2',
                                defaultAtomicDevice: false,
                                color: {
                                    displayLabel: 'green',
                                },
                                capacity: {
                                    sortValue: 2,
                                },
                            },
                        ] as HardwareDetailGroupAtomic[],
                        attributeGroups: [],
                    },
                };
                const action = {
                    type: `${gladosApi.reducerPath}/executeQuery/fulfilled`,
                    meta: {
                        arg: {
                            endpointName: getHardwareDetailGroup.name,
                            queryCacheKey: `${getHardwareDetailGroup.name}(undefined)`,
                        },
                    },
                    payload: mockPayload,
                };
                const newState = optionsSlice.reducer(initialTestState, action);
                expect(newState).toMatchObject({
                    atomicId: 'foo1',
                    currentColor: {
                        displayLabel: 'red',
                    },
                    currentCapacity: {
                        sortValue: 1,
                    },
                    loading: { getHardwareDetailGroup: false },
                    errors: { getHardwareDetailGroup: false },
                });
            });

            test('atomicId is found', () => {
                const initialTestState = {
                    ...initialState,
                    atomicId: 'foo1',
                };
                const mockPayload: HardwareDetailGroupResponse = {
                    data: {
                        modelName: 'Test Phone',
                        virtualItemId: 'test-id',
                        legacyGroupId: 'legacy-id',
                        promotionAttribute: { cellular: '5G' as Cellular },
                        url: {
                            hubpage: { href: 'test-url' },
                            galleryImage: { href: 'test-image' },
                        },
                        colors: [
                            { displayLabel: 'Red', primaryColorRgb: '255,0,0' },
                            { displayLabel: 'Green', primaryColorRgb: '0,255,0' },
                        ],
                        capacities: [
                            { displayLabel: '64GB', sortValue: 64 },
                            { displayLabel: '128GB', sortValue: 128 },
                        ],
                        atomics: [
                            {
                                hardwareId: 'foo1',
                                defaultAtomicDevice: true,
                                color: {
                                    displayLabel: 'red',
                                },
                                capacity: {
                                    sortValue: 1,
                                },
                            },
                            {
                                hardwareId: 'foo2',
                                defaultAtomicDevice: false,
                                color: {
                                    displayLabel: 'green',
                                },
                                capacity: {
                                    sortValue: 2,
                                },
                            },
                        ] as HardwareDetailGroupAtomic[],
                        attributeGroups: [],
                    },
                };
                const action = {
                    type: `${gladosApi.reducerPath}/executeQuery/fulfilled`,
                    meta: {
                        arg: {
                            endpointName: getHardwareDetailGroup.name,
                            queryCacheKey: `${getHardwareDetailGroup.name}(undefined)`,
                        },
                    },
                    payload: mockPayload,
                };
                const newState = optionsSlice.reducer(initialTestState, action);
                expect(newState).toMatchObject({
                    atomicId: 'foo1',
                    currentColor: {
                        displayLabel: 'red',
                    },
                    currentCapacity: {
                        sortValue: 1,
                    },
                    loading: { getHardwareDetailGroup: false },
                    errors: { getHardwareDetailGroup: false },
                });
            });

            test('no atomic with the atomicId in the state is found and default atomic is not found', () => {
                const initialTestState = {
                    ...initialState,
                    atomicId: 'foo3',
                };
                const mockPayload: HardwareDetailGroupResponse = {
                    data: {
                        modelName: 'Test Phone',
                        virtualItemId: 'test-id',
                        legacyGroupId: 'legacy-id',
                        promotionAttribute: { cellular: '5G' as Cellular },
                        url: {
                            hubpage: { href: 'test-url' },
                            galleryImage: { href: 'test-image' },
                        },
                        colors: [
                            { displayLabel: 'Red', primaryColorRgb: '255,0,0' },
                            { displayLabel: 'Green', primaryColorRgb: '0,255,0' },
                        ],
                        capacities: [
                            { displayLabel: '64GB', sortValue: 64 },
                            { displayLabel: '128GB', sortValue: 128 },
                        ],
                        atomics: [] as HardwareDetailGroupAtomic[],
                        attributeGroups: [],
                    },
                };
                const action = {
                    type: `${gladosApi.reducerPath}/executeQuery/fulfilled`,
                    meta: {
                        arg: {
                            endpointName: getHardwareDetailGroup.name,
                            queryCacheKey: `${getHardwareDetailGroup.name}(undefined)`,
                        },
                    },
                    payload: mockPayload,
                };
                const newState = optionsSlice.reducer(initialTestState, action);
                expect(newState).toMatchObject({
                    atomicId: null,
                    currentColor: null,
                    currentCapacity: null,
                    loading: { getHardwareDetailGroup: false },
                    errors: { getHardwareDetailGroup: false },
                });
            });
        });

        it('should handle getHardwareDetailGroup.pending', () => {
            const action = {
                type: `${gladosApi.reducerPath}/executeQuery/pending`,
                meta: {
                    arg: {
                        endpointName: 'getHardwareDetailGroup',
                        queryCacheKey: 'getHardwareDetailGroup(undefined)',
                    },
                },
                payload: undefined,
            };
            const newState = optionsSlice.reducer(initialState, action);
            expect(newState.loading.getHardwareDetailGroup).toBe(true);
        });

        it('should handle getHardwareDetailGroup.rejected', () => {
            const action = {
                type: `${gladosApi.reducerPath}/executeQuery/rejected`,
                meta: {
                    arg: {
                        endpointName: 'getHardwareDetailGroup',
                        queryCacheKey: 'getHardwareDetailGroup(undefined)',
                    },
                },
                payload: undefined,
            };
            const newState = optionsSlice.reducer(initialState, action);
            expect(newState.loading.getHardwareDetailGroup).toBe(false);
            expect(newState.errors.getHardwareDetailGroup).toBe(true);
            expect(newState.currentColor).toBeNull();
            expect(newState.currentCapacity).toBeNull();
        });

    });
});
