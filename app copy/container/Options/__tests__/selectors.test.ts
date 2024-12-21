import { RootState } from '@vfde-sails/core';
import { IInitialState } from '../interface';
import {
    selectAtomicDevice,
    selectAtomicDevices,
    selectAtomicId,
    selectCapacities,
    selectCapacitiesForColor,
    selectCellular,
    selectColors,
    selectCurrentCapacity,
    selectCurrentColor,
    selectShippingInfo,
    selectDeliveryScope,
    selectDeviceName,
    selectDevicePayload,
    selectImages,
    selectOptionsErrorsFlag,
    selectOptionsLoadingFlag,
    selectSizesForColor,
    selectTechnicalDetails,
    selectDeviceAndAtomicAttributeGroups,
} from '../selectors';
import { ADDITIONAL_PAGE_OPTIONS } from '@vfde-sails/constants';
import { AdditionalPageOptions } from '../../App/interfaces/additionalPageOptions';
import { IInitialState as IInitialStateApp } from '../../App/interfaces/state';
import {
    AttributeGroup,
    Capacity,
    Cellular,
    HardwareDetailGroupAtomic,
    HardwareDetailGroupResponse,
} from '@vfde-sails/glados-v2';
import appSlice from '../../../container/App/slice';
import optionsSlice from '../slice';

describe('Options Selectors', () => {

    afterEach(() => {
        window[ADDITIONAL_PAGE_OPTIONS] = {} as AdditionalPageOptions;
    });

    describe('selectIsLoading', () => {
        const isOptionsLoadingFlagSelector = selectOptionsLoadingFlag();
        describe('should select the loading state', () => {
            it('should return true if some are loading', () => {
                const mockedState: RootState<Partial<IInitialState>> = {
                    [optionsSlice.name]: {
                        loading: {
                            getDevice: true,
                        },
                    } as IInitialState,
                };
                expect(isOptionsLoadingFlagSelector(mockedState as RootState<IInitialState>)).toEqual(true);
            });

            it('should return false if none are loading', () => {
                const mockedState: RootState<Partial<IInitialState>> = {
                    [optionsSlice.name]: {
                        loading: {
                            getDevice: false,
                        },
                    } as IInitialState,
                };
                expect(isOptionsLoadingFlagSelector(mockedState as RootState<IInitialState>)).toEqual(false);
            });
        });
    });

    describe('selectHasError', () => {
        const optionsErrorFlagSelector = selectOptionsErrorsFlag();
        describe('should select the error state', () => {
            it('should return true if some have error', () => {
                const mockedState: RootState<Partial<IInitialState>> = {
                    [optionsSlice.name]: {
                        errors: {
                            getDevice: true,
                        },
                    } as IInitialState,
                };
                expect(optionsErrorFlagSelector(mockedState as RootState<IInitialState>)).toEqual(true);
            });

            it('should return false if none have error', () => {
                const mockedState: RootState<Partial<IInitialState>> = {
                    [optionsSlice.name]: {
                        errors: {
                            getDevice: false,
                        },
                    } as IInitialState,
                };
                expect(optionsErrorFlagSelector(mockedState as RootState<IInitialState>)).toEqual(false);
            });
        });
    });

    describe('selectAtomicId', () => {
        const devicesSelector = selectAtomicId();
        it('should select the atomic id', () => {
            const mockedState: RootState<Partial<IInitialState>> = {
                [optionsSlice.name]: {
                    atomicId: '123',
                } as IInitialState,
            };

            expect(devicesSelector(mockedState as RootState<IInitialState>)).toEqual('123');
        });
    });

    describe('selectCellular', () => {
        const devicesSelector = selectCellular();
        it('should select the atomic id', () => {
            const mockedState: RootState<Partial<IInitialState>> = {
                [optionsSlice.name]: {
                    devicePayload: {
                        data: {
                            promotionAttribute: {
                                cellular: Cellular.FiveGPlus,
                            },
                        },
                    },
                } as IInitialState & IInitialStateApp,
            };

            expect(devicesSelector(mockedState as RootState<IInitialState & IInitialStateApp>)).toEqual(Cellular.FiveGPlus);
        });
    });

    describe('selectCurrentColor', () => {
        const currentColorSelector = selectCurrentColor();
        it('should select the atomic id', () => {
            const currentColor = {
                displayLabel: 'black',
                primaryColorRgb: '0,0,0',
            };
            const mockedState: RootState<Partial<IInitialState>> = {
                [optionsSlice.name]: {
                    currentColor,
                } as IInitialState,
            };

            expect(currentColorSelector(mockedState as RootState<IInitialState>)).toEqual(currentColor);
        });
    });

    describe('selectCurrentCapacity', () => {
        const capacitySelector = selectCurrentCapacity();
        it('should select the selected capacity', () => {
            const currentCapacity: Capacity = {
                displayLabel: '54GB',
                sortValue: 54,
            };
            const mockedState: RootState<Partial<IInitialState>> = {
                [optionsSlice.name]: {
                    currentCapacity,
                } as IInitialState,
            };

            expect(capacitySelector(mockedState as RootState<IInitialState>)).toEqual(currentCapacity);
        });
    });

    describe('selectDeliveryScope', () => {
        const selector = selectDeliveryScope();

        describe('should return empty array', () => {
            it('when device payload is null', () => {
                expect(selector({
                    [optionsSlice.name]: {
                        devicePayload: null,
                    } as IInitialState & IInitialStateApp,
                })).toEqual([]);
            });

            it('when atomic is not found', () => {
                const mockedState: RootState<Partial<IInitialState & IInitialStateApp>> = {
                    [appSlice.name]: {
                        deviceId: 'device',
                    },
                    [optionsSlice.name]: {
                        atomicId: 'atomic',
                    } as IInitialState & IInitialStateApp,
                };
                expect(selector(mockedState as RootState<IInitialState & IInitialStateApp>)).toEqual([]);
            });
        });

        it('should return delivery scope as sorted array of strings from atomic', () => {
            window[ADDITIONAL_PAGE_OPTIONS] = {
                vlux: {
                    attributeIds: {
                        deliveryScope: 'scopeOfDelivery',
                    },
                    attributeGroupIds: {
                        characteristics: 'characteristics',
                    },
                },
            } as unknown as AdditionalPageOptions;

            const { attributeGroupIds, attributeIds } = window[ADDITIONAL_PAGE_OPTIONS].vlux;

            const mockedState: RootState<Partial<IInitialState & IInitialStateApp>> = {
                [appSlice.name]: {
                    deviceId: 'device',
                },
                [optionsSlice.name]: {
                    atomicId: 'atomic',
                    devicePayload: {
                        data: {
                            virtualItemId: 'device',
                            attributeGroups: [
                                {
                                    id: '1',
                                    attributes: [
                                        {
                                            uniqueIdentifier: 'scopeOfDelivery',
                                            values: [
                                                {
                                                    sortOrder: 2,
                                                    value: 'foo',
                                                },
                                                {
                                                    sortOrder: 1,
                                                    value: 'bar',
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                            atomics: [
                                {
                                    hardwareId: 'atomic',
                                    attributeGroups: [
                                        {
                                            id: attributeGroupIds.characteristics,
                                            attributes: [
                                                {
                                                    uniqueIdentifier: attributeIds.deliveryScope,
                                                    values: [
                                                        {
                                                            sortOrder: 1,
                                                            value: 'foobar1',
                                                        },
                                                        {
                                                            sortOrder: 2,
                                                            value: 'foobar2',
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    hardwareId: 'foo',
                                    attributeGroups: [
                                        {
                                            id: attributeGroupIds.characteristics,
                                            attributes: [
                                                {
                                                    uniqueIdentifier: attributeIds.deliveryScope,
                                                    values: [
                                                        {
                                                            sortOrder: 1,
                                                            value: 'barfoo',
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                } as IInitialState & IInitialStateApp,
            };

            expect(selector(mockedState as RootState<IInitialState & IInitialStateApp>)).toEqual([
                'foobar1',
                'foobar2',
            ]);
        });

        it('should return delivery scope as sorted array of strings from device and atomic', () => {
            window[ADDITIONAL_PAGE_OPTIONS] = {
                vlux: {
                    attributeIds: {
                        deliveryScope: 'scopeOfDelivery',
                    },
                    attributeGroupIds: {
                        characteristics: 'characteristics',
                    },
                },
            } as unknown as AdditionalPageOptions;

            const { attributeGroupIds, attributeIds } = window[ADDITIONAL_PAGE_OPTIONS].vlux;

            const mockedState: RootState<Partial<IInitialState & IInitialStateApp>> = {
                [appSlice.name]: {
                    deviceId: 'device',
                },
                [optionsSlice.name]: {
                    atomicId: 'atomic',
                    devicePayload: {
                        data: {
                            virtualItemId: 'device',
                            attributeGroups: [
                                {
                                    id: attributeGroupIds.characteristics,
                                    attributes: [
                                        {
                                            uniqueIdentifier: attributeIds.deliveryScope,
                                            values: [
                                                {
                                                    sortOrder: 2,
                                                    value: 'foo',
                                                },
                                                {
                                                    sortOrder: 1,
                                                    value: 'bar',
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                            atomics: [
                                {
                                    hardwareId: 'atomic',
                                    attributeGroups: [
                                        {
                                            id: attributeGroupIds.characteristics,
                                            attributes: [
                                                {
                                                    uniqueIdentifier: attributeIds.deliveryScope,
                                                    values: [
                                                        {
                                                            sortOrder: 1,
                                                            value: 'foobar',
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    hardwareId: 'foo',
                                    attributeGroups: [
                                        {
                                            id: attributeGroupIds.characteristics,
                                            attributes: [
                                                {
                                                    uniqueIdentifier: attributeIds.deliveryScope,
                                                    values: [
                                                        {
                                                            sortOrder: 1,
                                                            value: 'barfoo',
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                } as IInitialState & IInitialStateApp,
            };

            expect(selector(mockedState as RootState<IInitialState & IInitialStateApp>)).toEqual([
                'foobar',
                'bar',
                'foo',
            ]);
        });
    });

    describe('selectShippingInfo', () => {
        const selector = selectShippingInfo();

        it('should return false', () => {
            expect(selector({
                [optionsSlice.name]: {
                    devicePayload: null,
                } as IInitialState & IInitialStateApp,
            })).toBeFalsy();
        });

        it('should return delivery scope as sorted array of strings composed of device and atomic', () => {
            const shippingInfo = { date: '', label: '' };
            expect(selector({
                [optionsSlice.name]: {
                    atomicId: 'foo',
                    devicePayload: {
                        data: {
                            atomics: [{
                                hardwareId: 'foo',
                                shippingInfo,
                            }],
                        },
                    },
                } as IInitialState,
            })).toEqual(shippingInfo);
        });
    });

    describe('selectDeviceAndAtomicAttributeGroups', () => {
        const selector = selectDeviceAndAtomicAttributeGroups();

        it('should return null', () => {
            expect(selector({
                [optionsSlice.name]: {
                    devicePayload: null,
                } as IInitialState & IInitialStateApp,
            })).toBeNull();
        });

        it('should return attributeGroups for device and atomic', () => {
            const atomic = {
                hardwareId: 'foo',
                attributeGroups: 'atomicAttributeGroups' as unknown as AttributeGroup[],
            } as HardwareDetailGroupAtomic;
            const device = {
                modelName: 'foo',
                virtualItemId: 'foo',
                attributeGroups: 'deviceAttributeGroups' as unknown as AttributeGroup[],
                atomics: [
                    atomic,
                ],
            } as HardwareDetailGroupResponse['data'];
            const expected = ['deviceAttributeGroups', 'atomicAttributeGroups'];

            const mockState: RootState<Partial<IInitialState & IInitialStateApp>> = {
                [appSlice.name]: {
                    deviceId: 'bar',
                },
                [optionsSlice.name]: {
                    atomicId: 'foo',
                    devicePayload: {
                        data: device,
                    },
                } as IInitialState & IInitialStateApp,
            };

            expect(selector(mockState as RootState<IInitialState & IInitialStateApp>)).toEqual(expected);
        });
    });

    describe('selectCapacitiesForColor', () => {
        const selector = selectCapacitiesForColor();

        it('should return null if no devicepayload', () => {
            const mockedState: RootState<Partial<IInitialState & IInitialStateApp>> = {
                [optionsSlice.name]: {
                } as IInitialState & IInitialStateApp,
            };
            expect(selector(mockedState as RootState<IInitialState & IInitialStateApp>)).toBeNull();
        });

        it('should return default capacity if no color selected', () => {
            const fixture = [{
                displayLabel: 'foo',
                sortValue: 45,
            }, {
                displayLabel: 'bar',
                sortValue: 85,
            }];
            const mockedState: RootState<Partial<IInitialState & IInitialStateApp>> = {
                [optionsSlice.name]: {
                    devicePayload: {
                        data: {
                            capacities: fixture,
                        },
                    },
                } as IInitialState & IInitialStateApp,
            };
            expect(selector(mockedState as RootState<IInitialState & IInitialStateApp>)).toEqual(fixture);
        });

        it('should return the correct capacity for the selected color', () => {
            const fixture: Partial<HardwareDetailGroupResponse['data']['atomics'][number]>[] = [
                {
                    color: {
                        displayLabel: 'foo',
                        primaryColorRgb: 'bar',
                    },
                    capacity: {
                        displayLabel: 'foo',
                        sortValue: 45,
                    },
                }, {
                    color: {
                        displayLabel: 'bar',
                        primaryColorRgb: 'foo',
                    },
                    capacity: {
                        displayLabel: 'foo',
                        sortValue: 65,
                    },
                },
            ];
            const mockedState: RootState<Partial<IInitialState & IInitialStateApp>> = {
                [optionsSlice.name]: {
                    currentColor: {
                        displayLabel: 'foo',
                    },
                    devicePayload: {
                        data: {
                            atomics: fixture,
                        },
                    },
                } as IInitialState & IInitialStateApp,
            };
            expect(selector(mockedState as RootState<IInitialState & IInitialStateApp>)).toEqual([fixture[0].capacity]);
        });
    });

    describe('selectSizesForColor', () => {
        const selector = selectSizesForColor();

        it('should return null if no devicepayload or color selected', () => {
            const mockedState: RootState<Partial<IInitialState & IInitialStateApp>> = {
                [optionsSlice.name]: {
                } as IInitialState & IInitialStateApp,
            };
            expect(selector(mockedState as RootState<IInitialState & IInitialStateApp>)).toBeNull();
        });

        it('should return default corresponding size for selected color', () => {
            const fixture: Partial<HardwareDetailGroupResponse['data']['atomics'][number]>[] = [{
                color: {
                    displayLabel: 'foo',
                    primaryColorRgb: 'bar',
                },
                capacity: {
                    displayLabel: 'bar',
                    sortValue: 45,
                },
            }, {
                color: {
                    displayLabel: 'bar',
                    primaryColorRgb: 'foofoo',
                },
                capacity: {
                    displayLabel: 'foo',
                    sortValue: 55,
                },
            }];
            const mockedState: RootState<Partial<IInitialState & IInitialStateApp>> = {
                [optionsSlice.name]: {
                    currentColor: {
                        displayLabel: 'foo',
                        primaryColorRgb: 'bar',
                    },
                    devicePayload: {
                        data: {
                            atomics: fixture,
                        },
                    },
                } as IInitialState & IInitialStateApp,
            };
            expect(selector(mockedState as RootState<IInitialState & IInitialStateApp>)).toEqual([fixture[0].capacity]);
        });
    });

    describe('selectDevicePayload', () => {
        const selector = selectDevicePayload();
        it('should return null', () => {
            const mockedState: RootState<Partial<IInitialState>> = {
                [optionsSlice.name]: {
                } as IInitialState & IInitialStateApp,
            };

            expect(selector(mockedState as RootState<IInitialState & IInitialStateApp>)).toBeNull();
        });

        it('should select the devicepayload', () => {
            const devicePayload = {};
            const mockedState: RootState<Partial<IInitialState>> = {
                [optionsSlice.name]: {
                    devicePayload,
                } as IInitialState & IInitialStateApp,
            };

            expect(selector(mockedState as RootState<IInitialState & IInitialStateApp>)).toEqual(devicePayload);
        });
    });

    describe('selectDeviceName', () => {
        const selector = selectDeviceName();
        it('should select the selected device name', () => {
            const fixture = {
                modelName: 'foo',
            };
            const mockedState: RootState<Partial<IInitialState>> = {
                [optionsSlice.name]: {
                    devicePayload: {
                        data: fixture,
                    },
                } as IInitialState & IInitialStateApp,
            };

            expect(selector(mockedState as RootState<IInitialState & IInitialStateApp>)).toEqual(fixture.modelName);
        });
    });

    describe('selectColors', () => {
        const selector = selectColors();

        it('should return null', () => {
            const mockedState: RootState<Partial<IInitialState>> = {
                [optionsSlice.name]: {
                } as IInitialState & IInitialStateApp,
            };

            expect(selector(mockedState as RootState<IInitialState & IInitialStateApp>)).toBeNull();
        });

        it('should select color', () => {
            const colors = [{
                primaryColorRgb: '0,0,0',
                displayLabel: 'black',
            }];
            const mockedState: RootState<Partial<IInitialState>> = {
                [optionsSlice.name]: {
                    devicePayload: {
                        data: {
                            colors,
                        },
                    },
                } as IInitialState & IInitialStateApp,
            };

            expect(selector(mockedState as RootState<IInitialState & IInitialStateApp>)).toEqual(colors);
        });
    });

    describe('selectCapacities', () => {
        const selector = selectCapacities();

        it('should return null', () => {
            expect(selector({
                [optionsSlice.name]: {
                    devicePayload: null,
                } as IInitialState & IInitialStateApp,
            })).toBeNull();
        });

        it('should return all capacities with prices', () => {
            const fixture = [
                {
                    displayLabel: 'foo',
                    sortValue: 1,
                },
                {
                    displayLabel: 'bar',
                    sortValue: 2,
                },
            ];

            expect(selector({
                [optionsSlice.name]: {
                    devicePayload: {
                        data: {
                            capacities: fixture.map(item => ({ displayLabel: item.displayLabel, sortValue: item.sortValue })),
                            atomics: [
                                {
                                    capacity: {
                                        displayLabel: 'foobar',
                                    },
                                },
                                ...fixture.map(item => ({
                                    capacity: { displayLabel: item.displayLabel },
                                })),
                            ],
                        },
                    },
                } as IInitialState & IInitialStateApp,
            })).toEqual(fixture);
        });
    });

    describe('selectImages', () => {
        const selector = selectImages();

        it('should return null', () => {
            const mockedState: RootState<Partial<IInitialState>> = {
                [optionsSlice.name]: {
                } as IInitialState & IInitialStateApp,
            };

            expect(selector(mockedState as RootState<IInitialState & IInitialStateApp>)).toBeNull();
        });

        it('should select the images from the atomic', () => {
            const atomics = [
                {
                    hardwareId: '123',
                    imageList: {
                        href: ['foo'],
                        imageGroup: 'bar',
                    },
                },
            ];
            const mockedState: RootState<Partial<IInitialState>> = {
                [optionsSlice.name]: {
                    atomicId: '123',
                    devicePayload: {
                        data: {
                            atomics,
                        },
                    },
                } as IInitialState & IInitialStateApp,
            };

            expect(selector(mockedState as RootState<IInitialState & IInitialStateApp>)).toEqual(atomics[0].imageList.href);
        });
    });

    describe('selectTechnicalDetails', () => {
        const selector = selectTechnicalDetails();

        it('should return null', () => {
            expect(selector({
                [optionsSlice.name]: {
                    devicePayload: null,
                } as IInitialState & IInitialStateApp,
            })).toBeNull();
        });

        it('should return technical details for device and atomic filtered, transformed and merged', () => {
            window[ADDITIONAL_PAGE_OPTIONS] = {
                technicalDetails: {
                    icons: {
                        2: 'foo',
                        3: 'bar',
                    },
                },
                vlux: {
                    attributeIds: {
                        deliveryScope: 'scopeOfDelivery',
                    },
                    attributeGroupIds: {
                        characteristics: 'characteristics',
                        top: 'top',
                        display: 'display',
                        camera: 'camera',
                        memory: 'memory',
                        sim: 'sim',
                        connectivity: 'connectivity',
                        entertainment: 'entertainment',
                        handling: 'handling',
                        organizer: 'organizer',
                    },
                    attributeValues: {
                        yes: 'ja',
                        no: 'nein',
                    },
                },
            } as unknown as AdditionalPageOptions;

            const mockState: RootState<Partial<IInitialState & IInitialStateApp>> = {
                [appSlice.name]: {
                    deviceId: 'device',
                },
                [optionsSlice.name]: {
                    atomicId: 'atomic1',
                    devicePayload: {
                        data: {
                            attributeGroups: [
                                {
                                    id: '2',
                                    displayLabel: 'Foo',
                                    sortOrder: 1,
                                    attributes: [
                                        {
                                            displayLabel: 'FooItem',
                                            sortOrder: 1,
                                            values: [
                                                {
                                                    sortOrder: 1,
                                                    value: 'foo',
                                                },
                                            ],
                                        },
                                        {
                                            displayLabel: 'BarItem',
                                            sortOrder: 2,
                                            values: [
                                                {
                                                    sortOrder: 1,
                                                    value: 'foo',
                                                },
                                            ],
                                        },
                                        {
                                            displayLabel: 'ItemWithMultipleValues',
                                            sortOrder: 3,
                                            values: [
                                                {
                                                    sortOrder: 1,
                                                    value: 'foo',
                                                },
                                                {
                                                    sortOrder: 2,
                                                    value: 'bar',
                                                },
                                            ],
                                        },
                                        {
                                            displayLabel: 'ItemWithoutValue',
                                            sortOrder: 4,
                                            values: [],
                                        },
                                    ],
                                },
                                {
                                    id: '3',
                                    displayLabel: 'Bar',
                                    sortOrder: 2,
                                    attributes: [
                                        {
                                            displayLabel: 'FooItem',
                                            sortOrder: 1,
                                            values: [
                                                {
                                                    sortOrder: 1,
                                                    value: 'true',
                                                },
                                            ],
                                        },
                                        {
                                            displayLabel: 'BarItem',
                                            sortOrder: 2,
                                            values: [
                                                {
                                                    sortOrder: 1,
                                                    value: 'false',
                                                },
                                            ],
                                        },
                                        {
                                            displayLabel: 'FooBarItem',
                                            sortOrder: 3,
                                            values: [
                                                {
                                                    sortOrder: 1,
                                                    value: 'foo',
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                            atomics: [
                                {
                                    hardwareId: 'atomic1',
                                    attributeGroups: [
                                        {
                                            id: '2',
                                            displayLabel: 'Foo',
                                            sortOrder: 1,
                                            attributes: [
                                                {
                                                    displayLabel: 'FooItem',
                                                    unit: 'h',
                                                    sortOrder: 1,
                                                    values: [
                                                        {
                                                            sortOrder: 1,
                                                            value: '2',
                                                        },
                                                    ],
                                                },
                                                {
                                                    displayLabel: 'BarItem',
                                                    sortOrder: 2,
                                                    values: [
                                                        {
                                                            sortOrder: 1,
                                                            value: 'barfoo',
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                        {
                                            id: '3',
                                            displayLabel: 'Bar',
                                            sortOrder: 2,
                                            attributes: [
                                                {
                                                    displayLabel: 'FooItem',
                                                    sortOrder: 1,
                                                    values: [
                                                        {
                                                            sortOrder: 1,
                                                            value: 'false',
                                                        },
                                                    ],
                                                },
                                                {
                                                    displayLabel: 'BarItem',
                                                    sortOrder: 2,
                                                    values: [
                                                        {
                                                            sortOrder: 1,
                                                            value: 'true',
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    hardwareId: 'atomic2',
                                    attributeGroups: [
                                        {
                                            id: '3',
                                            sortOrder: 5,
                                            attributes: [
                                                {
                                                    id: window[ADDITIONAL_PAGE_OPTIONS].vlux.attributeIds.deliveryScope,
                                                    sortOrder: 1,
                                                    values: [
                                                        {
                                                            sortOrder: 1,
                                                            value: 'barfoo',
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                } as IInitialState & IInitialStateApp,
            };

            const response = selector(mockState as RootState<IInitialState & IInitialStateApp>);

            expect(response).toEqual({
                /* eslint-disable camelcase, @typescript-eslint/naming-convention */
                Foo: {
                    id: '2',
                    sortOrder: 1,
                    attributes: {
                        FooItem: '2 h',
                        BarItem: 'barfoo',
                        ItemWithMultipleValues: 'foo, bar',
                        ItemWithoutValue: '',
                    },
                },
                Bar: {
                    id: '3',
                    sortOrder: 2,
                    attributes: {
                        FooItem: 'nein',
                        BarItem: 'ja',
                        FooBarItem: 'foo',
                    },
                },
                /* eslint-enable camelcase, @typescript-eslint/naming-convention */
            });
        });
    });

    describe('selectAtomicDevice', () => {
        const selector = selectAtomicDevice();
        it('should return null', () => {
            const mockedState: RootState<Partial<IInitialState>> = {
                [optionsSlice.name]: {
                } as IInitialState & IInitialStateApp,
            };

            expect(selector(mockedState as RootState<IInitialState & IInitialStateApp>)).toBeNull();
        });

        const atomics = [{
            hardwareId: '123',
            defaultAtomicDevice: true,
        }];

        it('should select the selected atomic device', () => {
            const mockedState: RootState<Partial<IInitialState & IInitialStateApp>> = {
                [appSlice.name]: {
                    atomicId: '123',
                },
                [optionsSlice.name]: {
                    devicePayload: {
                        data: {
                            atomics,
                        },
                    },
                } as IInitialState & IInitialStateApp,
            };

            expect(selector(mockedState as RootState<IInitialState & IInitialStateApp>)).toEqual(atomics[0]);
        });

        it('should return the default atomic if no atomic selected', () => {

            const mockedState: RootState<Partial<IInitialState>> = {
                [optionsSlice.name]: {
                    devicePayload: {
                        data: {
                            atomics,
                        },
                    },
                } as IInitialState & IInitialStateApp,
            };

            expect(selector(mockedState as RootState<IInitialState & IInitialStateApp>)).toEqual(atomics[0]);
        });
    });

    describe('selectAtomicDevices', () => {
        const selector = selectAtomicDevices();
        it('should return an empty array', () => {
            const mockedState: RootState<Partial<IInitialState>> = {
                [optionsSlice.name]: {
                } as IInitialState & IInitialStateApp,
            };

            expect(selector(mockedState as RootState<IInitialState & IInitialStateApp>)).toEqual([]);
        });

        it('should return atomic devices', () => {
            const atomics: Partial<HardwareDetailGroupResponse['data']['atomics'][number]>[] = [{
                hardwareId: '123',
            }];
            const mockedState: RootState<Partial<IInitialState & IInitialStateApp>> = {
                [optionsSlice.name]: {
                    devicePayload: {
                        data: {
                            atomics,
                        },
                    },
                } as IInitialState & IInitialStateApp,
            };

            expect(selector(mockedState as RootState<IInitialState & IInitialStateApp>)).toEqual(atomics);
        });
    });

});

