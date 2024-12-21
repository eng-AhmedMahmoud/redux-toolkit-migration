import optionsSlice, {
    changeCapacity,
    changeColor,
    getDevice,
    getDeviceFailed,
    getDeviceSuccess,
    setAtomicId,
    setDefaultState,
} from '../slice';
import {
    Capacity,
    Color,
    HardwareDetailGroupResponse,
} from '@vfde-sails/glados-v2';
import produce from 'immer';
import { IInitialState } from '../interface';

describe('VVL Device Details Optiona Slice', () => {
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

        describe('getDeviceSuccess', () => {
            it('should return the correct type', () => {
                const fixture = {
                    foo: 'bar',
                } as unknown as HardwareDetailGroupResponse;
                const expected = {
                    type: expect.any(String),
                    payload: fixture,
                };

                expect(getDeviceSuccess(fixture)).toEqual(expected);
            });
        });

        describe('getDeviceFailed', () => {
            it('should return the correct type', () => {
                const expected = {
                    type: expect.any(String),
                };

                expect(getDeviceFailed()).toEqual(expected);
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
                draft.loading.getDevice = true;
            }));
        });

        describe('should handle the getDeviceSuccess action correctly', () => {
            const fixture = {
                data: {
                    modelName: 'Foo',
                    atomics: [
                        {
                            defaultAtomicDevice: true,
                            hardwareId: '123',
                            color: {
                                displayLabel: '123',
                            },
                            capacity: {
                                displayLabel: '123',
                            },
                        },
                        {
                            defaultAtomicDevice: false,
                            hardwareId: '456',
                            color: {
                                displayLabel: '456',
                            },
                            capacity: {
                                displayLabel: '456',
                            },
                        },
                    ],
                },
            } as HardwareDetailGroupResponse;

            const mockState = {
                ...optionsSlice.getInitialState(),
            };

            it('with preselected atomic', () => {
                const expected = produce({
                    ...mockState,
                }, draft => {
                    draft.loading.getDevice = false;
                    draft.atomicId = '123';
                    draft.devicePayload = fixture;
                    draft.currentCapacity = {
                        displayLabel: '123',
                    } as Capacity;
                    draft.currentColor = {
                        displayLabel: '123',
                    } as Color;
                });

                expect(optionsSlice.reducer(mockState as IInitialState, getDeviceSuccess(fixture))).toEqual(expected);
            });

            describe('with default atomic', () => {
                it('with empty atomic id', () => {
                    const expected = produce(mockState, draft => {
                        draft.loading.getDevice = false;
                        draft.devicePayload = fixture;
                        draft.atomicId = '123';
                        draft.currentCapacity = {
                            displayLabel: '123',
                        } as Capacity;
                        draft.currentColor = {
                            displayLabel: '123',
                        } as Color;
                    });

                    expect(optionsSlice.reducer(mockState, getDeviceSuccess(fixture))).toEqual(expected);
                });

                it('with pre-selected atomic ID from another device', () => {
                    const expected = produce({
                        ...mockState,
                    }, draft => {
                        draft.loading.getDevice = false;
                        draft.devicePayload = fixture;
                        draft.atomicId = '123';
                        draft.currentCapacity = {
                            displayLabel: '123',
                        } as Capacity;
                        draft.currentColor = {
                            displayLabel: '123',
                        } as Color;
                    });

                    expect(optionsSlice.reducer({
                        ...mockState,
                    } as IInitialState, getDeviceSuccess(fixture))).toEqual(expected);
                });

                it('handles when the atomicId is not matching with any atomic', () => {
                    const deviceResponseFixture = {
                        data: {
                            ...fixture.data,
                            atomics: fixture.data.atomics.map(atomic => ({ ...atomic, defaultAtomicDevice: false })),
                        },
                    };

                    const expected = produce({
                        ...mockState,
                    }, draft => {
                        draft.loading.getDevice = false;
                        draft.devicePayload = deviceResponseFixture;
                        draft.atomicId = null;
                        draft.currentCapacity = null;
                        draft.currentColor = null;
                    });

                    expect(optionsSlice.reducer({
                        ...mockState,
                        atomicId: '789',
                    } as IInitialState, getDeviceSuccess(deviceResponseFixture))).toEqual(expected);
                });
            });
        });

        it('should handle the getDeviceFailed action correctly', () => {

            const expected = produce(optionsSlice.getInitialState(), draft => {
                draft.loading.getDevice = false;
                draft.errors.getDevice = true;
            });
            expect(optionsSlice.reducer(optionsSlice.getInitialState(), getDeviceFailed())).toEqual(expected);
        });

    });
});
