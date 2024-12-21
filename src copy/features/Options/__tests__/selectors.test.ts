import { RootState } from '../../../app/store';
import { optionsState } from '../interface';
import {
    selectDeviceState,
    selectDevicePayload,
    selectDeviceName,
    selectCapacities,
    selectColors,
    selectAtomicDevices,
    selectAtomicIds,
    selectAtomicDevice,
    selectImages,
    selectShippingInfo,
    selectColorOptions,
    selectCapacitiesForColor,
    selectAtomicImages,
    selectCellular,
    selectTechnicalDetails,
    selectDeviceAndAtomicAttributeGroups,
    selectDeliveryScope,
    selectAtomicId,
    selectCurrentColor,
    selectCurrentCapacity,
    selectActiveAccordionItemId,
    selectOptionsLoadingFlag,
    selectOptionsErrorsFlag,
} from '../selectors';
import { ADDITIONAL_PAGE_OPTIONS } from '@vfde-sails/constants';
import { AdditionalPageOptions } from '../../App/interfaces/additionalPageOptions';
import { IInitialState as IInitialStateApp } from '../../App/interfaces/state';
import {
    AttributeGroup,
    Capacity,
    Cellular,
    Color,
    HardwareDetailGroupAtomic,
    HardwareDetailGroupResponse,
} from '@vfde-sails/glados-v2';
import appSlice from '../../App/slice';
import optionsSlice from '../slice';

jest.mock('../../Tariff/selectors.ts');
jest.mock('../../App/selectors.ts');

describe('Options Selectors', () => {
    afterEach(() => {
        window[ADDITIONAL_PAGE_OPTIONS] = {} as AdditionalPageOptions;
    });

    describe('selectOptionsLoadingFlag', () => {
        it('should return true if some are loading', () => {
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    loading: {
                        getHardwareDetailGroup: true,
                    },
                },
            } as RootState;
            expect(selectOptionsLoadingFlag(mockedState)).toEqual(true);
        });

        it('should return false if none are loading', () => {
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    loading: {
                        getHardwareDetailGroup: false,
                    },
                },
            } as RootState;
            expect(selectOptionsLoadingFlag(mockedState)).toEqual(false);
        });
    });

    describe('selectOptionsErrorsFlag', () => {
        it('should return true if some have error', () => {
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    errors: {
                        getHardwareDetailGroup: true,
                    },
                },
            } as RootState;
            expect(selectOptionsErrorsFlag(mockedState)).toEqual(true);
        });

        it('should return false if none have error', () => {
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    errors: {
                        getHardwareDetailGroup: false,
                    },
                },
            } as RootState;
            expect(selectOptionsErrorsFlag(mockedState)).toEqual(false);
        });
    });

    describe('selectAtomicId', () => {
        it('should select the atomic id', () => {
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    atomicId: '123',
                } as optionsState,
            } as RootState;
            expect(selectAtomicId(mockedState)).toEqual('123');
        });
    });

    describe('selectAtomicIds', () => {
        it('should return an empty array when there are no atomic devices', () => {
            const state: Partial<RootState> = {
                vvlDeviceDetailsOptions: {
                    devicePayload: { data: { atomics: [] } },
                } as unknown as optionsState,
            };
            expect(selectAtomicIds(state as RootState)).toEqual([]);
        });

        it('should return an array of hardwareIds', () => {
            const state: Partial<RootState> = {
                vvlDeviceDetailsOptions: {
                    devicePayload: {
                        data: {
                            atomics: [
                                { hardwareId: 'atomic1' },
                                { hardwareId: 'atomic2' },
                                { hardwareId: 'atomic3' },
                            ],
                        },
                    },
                } as optionsState,
            };
            expect(selectAtomicIds(state as RootState)).toEqual(['atomic1', 'atomic2', 'atomic3']);
        });
    });

    describe('selectCellular', () => {
        it('should select the cellular type', () => {
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    devicePayload: {
                        data: {
                            promotionAttribute: {
                                cellular: Cellular.FiveGPlus,
                            },
                        },
                    },
                } as optionsState,
            } as RootState;
            expect(selectCellular(mockedState)).toEqual(Cellular.FiveGPlus);
        });

        it('should return null when device payload is null', () => {
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    devicePayload: null,
                } as optionsState,
            } as RootState;
            expect(selectCellular(mockedState)).toBeNull();
        });

        it('should return null when cellular attribute is undefined', () => {
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    devicePayload: {
                        data: {
                            promotionAttribute: {},
                        },
                    },
                } as optionsState,
            } as RootState;
            expect(selectCellular(mockedState)).toBeNull();
        });
    });

    describe('selectCurrentColor', () => {
        it('should select the current color', () => {
            const currentColor = {
                displayLabel: 'black',
                primaryColorRgb: '0,0,0',
            };
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    currentColor,
                },
            } as RootState;
            expect(selectCurrentColor(mockedState)).toEqual(currentColor);
        });
    });

    describe('selectCurrentCapacity', () => {
        it('should select the current capacity', () => {
            const currentCapacity: Capacity = {
                displayLabel: '54GB',
                sortValue: 54,
            };
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    currentCapacity,
                },
            } as RootState;
            expect(selectCurrentCapacity(mockedState)).toEqual(currentCapacity);
        });
    });

    describe('selectDeliveryScope', () => {
        it('should return empty array when device payload is null', () => {
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    devicePayload: null,
                } as optionsState,
            } as RootState;
            expect(selectDeliveryScope(mockedState)).toEqual([]);
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

            const mockedState: RootState = {
                [appSlice.name]: {
                    deviceId: 'device',
                } as IInitialStateApp,
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
                } as optionsState,
            } as RootState;

            expect(selectDeliveryScope(mockedState)).toEqual([
                'foobar1',
                'foobar2',
            ]);
        });
    });

    describe('selectShippingInfo', () => {
        it('should return false when device payload is null', () => {
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    devicePayload: null,
                } as optionsState,
            } as RootState;
            expect(selectShippingInfo(mockedState)).toBeFalsy();
        });

        it('should return shipping info for the selected atomic', () => {
            const shippingInfo = { date: '2023-06-01', label: 'Express Delivery' };
            const mockedState: RootState = {
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
                } as optionsState,
            } as RootState;
            expect(selectShippingInfo(mockedState)).toEqual(shippingInfo);
        });
    });

    describe('selectDeviceAndAtomicAttributeGroups', () => {
        it('should return null when device payload is null', () => {
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    devicePayload: null,
                } as optionsState,
            } as RootState;
            expect(selectDeviceAndAtomicAttributeGroups(mockedState)).toBeNull();
        });

        it('should return attribute groups for device and atomic', () => {
            const atomic = {
                hardwareId: 'foo',
                attributeGroups: ['atomicAttributeGroups'] as unknown as AttributeGroup[],
            } as HardwareDetailGroupAtomic;
            const device = {
                modelName: 'foo',
                virtualItemId: 'foo',
                attributeGroups: ['deviceAttributeGroups'] as unknown as AttributeGroup[],
                atomics: [
                    atomic,
                ],
            } as HardwareDetailGroupResponse['data'];
            const expected = [['deviceAttributeGroups'], ['atomicAttributeGroups']];

            const mockedState: RootState = {
                [appSlice.name]: {
                    deviceId: 'bar',
                } as IInitialStateApp,
                [optionsSlice.name]: {
                    atomicId: 'foo',
                    devicePayload: {
                        data: device,
                    },
                } as optionsState,
            } as RootState;

            expect(selectDeviceAndAtomicAttributeGroups(mockedState)).toEqual(expected);
        });
    });

    describe('selectCapacitiesForColor', () => {
        it('should return null if no devicepayload', () => {
            const mockedState: RootState = {
                [optionsSlice.name]: {
                },
            } as RootState;
            expect(selectCapacitiesForColor(mockedState)).toBeNull();
        });

        it('should return default capacity if no color selected', () => {
            const fixture = [{
                displayLabel: 'foo',
                sortValue: 45,
            }, {
                displayLabel: 'bar',
                sortValue: 85,
            }];
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    devicePayload: {
                        data: {
                            capacities: fixture,
                        },
                    },
                },
            } as RootState;
            expect(selectCapacitiesForColor(mockedState)).toEqual(fixture);
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
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    currentColor: {
                        displayLabel: 'foo',
                    },
                    devicePayload: {
                        data: {
                            atomics: fixture,
                        },
                    },
                },
            } as RootState;
            expect(selectCapacitiesForColor(mockedState)).toEqual([fixture[0].capacity]);
        });
    });

    describe('selectDeviceName', () => {
        it('should return null when device payload is null', () => {
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    devicePayload: null,
                } as optionsState,
            } as RootState;
            expect(selectDeviceName(mockedState)).toBeNull();
        });

        it('should return device name', () => {
            const deviceName = 'Test Device';
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    devicePayload: {
                        data: {
                            modelName: deviceName,
                        },
                    },
                } as optionsState,
            } as RootState;
            expect(selectDeviceName(mockedState)).toBe(deviceName);
        });
    });

    describe('selectDeviceState', () => {
        it('should return state from options slice', () => {
            const mockOptionsState = {
                atomicId: 'test123',
                loading: false,
                errors: null,
            };
            const mockedState: RootState = {
                [optionsSlice.name]: mockOptionsState,
            } as unknown as RootState;

            expect(selectDeviceState(mockedState)).toEqual(mockOptionsState);
        });

        it('should return initial state when options slice is not in state', () => {
            const mockedState = {} as RootState;
            const initialState = optionsSlice.getInitialState();

            expect(selectDeviceState(mockedState)).toEqual(initialState);
        });
    });

    describe('selectDevicePayload', () => {
        it('should return null when device payload is null', () => {
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    devicePayload: null,
                } as optionsState,
            } as RootState;
            expect(selectDevicePayload(mockedState)).toBeNull();
        });

        it('should return device payload', () => {
            const devicePayload = { data: { modelName: 'Test Device' } };
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    devicePayload,
                } as optionsState,
            } as RootState;
            expect(selectDevicePayload(mockedState)).toEqual(devicePayload);
        });
    });

    describe('selectImages', () => {
        it('should return null when device payload is null', () => {
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    devicePayload: null,
                },
            } as RootState;
            expect(selectImages(mockedState)).toEqual(null);
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
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    atomicId: '123',
                    devicePayload: {
                        data: {
                            atomics,
                        },
                    },
                },
            } as RootState;

            expect(selectImages(mockedState)).toEqual(atomics[0].imageList.href);
        });
    });

    describe('selectColors', () => {
        it('should return empty array when device payload is null', () => {
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    devicePayload: null,
                } as optionsState,
            } as RootState;
            expect(selectColors(mockedState)).toEqual([]);
        });

        it('should return colors array', () => {
            const colors = [
                { displayLabel: 'Red', primaryColorRgb: '255,0,0' },
                { displayLabel: 'Blue', primaryColorRgb: '0,0,255' },
            ];
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    devicePayload: {
                        data: {
                            colors,
                        },
                    },
                } as optionsState,
            } as RootState;
            expect(selectColors(mockedState)).toEqual(colors);
        });
    });

    describe('selectCapacities', () => {
        it('should return empty array when device payload is null', () => {
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    devicePayload: null,
                } as optionsState,
            } as RootState;
            expect(selectCapacities(mockedState)).toEqual([]);
        });

        it('should return capacities array', () => {
            const capacities = [
                { displayLabel: '64GB', sortValue: 64 },
                { displayLabel: '128GB', sortValue: 128 },
            ];
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    devicePayload: {
                        data: {
                            capacities,
                        },
                    },
                } as optionsState,
            } as RootState;
            expect(selectCapacities(mockedState)).toEqual(capacities);
        });
    });

    describe('selectActiveAccordionItemId', () => {
        it('should return null when no accordion item is active', () => {
            const state: Partial<RootState> = {
                vvlDeviceDetailsOptions: {
                    activeAccordionItemId: null,
                } as optionsState,
            };
            expect(selectActiveAccordionItemId(state as RootState)).toBeNull();
        });

        it('should return the active accordion item id', () => {
            const state: Partial<RootState> = {
                vvlDeviceDetailsOptions: {
                    activeAccordionItemId: 'accordion1',
                } as optionsState,
            };
            expect(selectActiveAccordionItemId(state as RootState)).toBe('accordion1');
        });
    });

    describe('selectColorOptions', () => {
        it('should return an empty array when device payload is null', () => {
            const state: Partial<RootState> = {
                vvlDeviceDetailsOptions: {
                    devicePayload: null,
                } as optionsState,
            };
            expect(selectColorOptions(state as RootState)).toEqual([]);
        });

        it('should return an array of color options', () => {
            const colors: Color[] = [
                { displayLabel: 'Red', primaryColorRgb: '255,0,0' },
                { displayLabel: 'Blue', primaryColorRgb: '0,0,255' },
            ];
            const state: Partial<RootState> = {
                vvlDeviceDetailsOptions: {
                    devicePayload: {
                        data: {
                            colors,
                        },
                    },
                } as optionsState,
            };
            expect(selectColorOptions(state as RootState)).toEqual(colors);
        });
    });

    describe('selectAtomicImages', () => {
        it('should return null when atomic device is not found', () => {
            const state: Partial<RootState> = {
                vvlDeviceDetailsOptions: {
                    atomicId: 'nonexistent',
                    devicePayload: {
                        data: {
                            atomics: [],
                        },
                    },
                } as unknown as optionsState,
            };
            expect(selectAtomicImages(state as RootState)).toBeNull();
        });

        it('should return the image list when atomic device is found', () => {
            const images = ['image1.jpg', 'image2.jpg'];
            const state: Partial<RootState> = {
                vvlDeviceDetailsOptions: {
                    atomicId: 'atomic1',
                    devicePayload: {
                        data: {
                            atomics: [
                                {
                                    hardwareId: 'atomic1',
                                    imageList: {
                                        href: images,
                                    },
                                },
                            ],
                        },
                    },
                } as optionsState,
            };
            expect(selectAtomicImages(state as RootState)).toEqual(images);
        });
    });

    describe('selectTechnicalDetails', () => {
        it('should return null', () => {
            expect(selectTechnicalDetails({
                [optionsSlice.name]: {
                    devicePayload: null,
                },
            } as RootState)).toBeNull();
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

            const mockState: RootState = {
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
                },
            } as RootState;

            const response = selectTechnicalDetails(mockState);

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
        it('should return null', () => {
            const mockedState: RootState = {
                [optionsSlice.name]: {
                },
            } as RootState;

            expect(selectAtomicDevice(mockedState)).toBeNull();
        });

        const atomics = [{
            hardwareId: '123',
            defaultAtomicDevice: true,
        }];

        it('should select the selected atomic device', () => {
            const mockedState: RootState = {
                [appSlice.name]: {
                    atomicId: '123',
                },
                [optionsSlice.name]: {
                    devicePayload: {
                        data: {
                            atomics,
                        },
                    },
                },
            } as unknown as RootState;

            expect(selectAtomicDevice(mockedState)).toEqual(atomics[0]);
        });

        it('should return the default atomic if no atomic selected', () => {

            const mockedState: RootState = {
                [optionsSlice.name]: {
                    devicePayload: {
                        data: {
                            atomics,
                        },
                    },
                },
            } as RootState;

            expect(selectAtomicDevice(mockedState)).toEqual(atomics[0]);
        });
    });

    describe('selectAtomicDevices', () => {
        it('should return an empty array', () => {
            const mockedState: RootState = {
                [optionsSlice.name]: {
                },
            } as RootState;

            expect(selectAtomicDevices(mockedState)).toEqual([]);
        });

        it('should return atomic devices', () => {
            const atomics: Partial<HardwareDetailGroupResponse['data']['atomics'][number]>[] = [{
                hardwareId: '123',
            }];
            const mockedState: RootState = {
                [optionsSlice.name]: {
                    devicePayload: {
                        data: {
                            atomics,
                        },
                    },
                },
            } as RootState;

            expect(selectAtomicDevices(mockedState)).toEqual(atomics);
        });
    });
});

