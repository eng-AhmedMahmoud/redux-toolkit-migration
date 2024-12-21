import {
    createSelector,
    Selector,
} from 'reselect';
import optionsSlice from './slice';
import {
    createDeepEqualSelectorInput,
    createDeepEqualSelectorOutput,
    RootState,
} from '@vfde-sails/core';
import {
    IInitialState,
    IInitialState as IInitialStateOptions,
    StateProps,
} from './interface';
import { IInitialState as IInitialStateApp } from '../App/interfaces/state';
import { ADDITIONAL_PAGE_OPTIONS } from '@vfde-sails/constants';
import {
    AttributeGroup,
    Capacity,
    Color,
    getTechnicalDetails,
    HardwareDetailGroupResponse,
    HardwareDevice,
} from '@vfde-sails/glados-v2';

const selectOptionsContainerState = (state: RootState<IInitialStateOptions>) => state[optionsSlice.name] || optionsSlice.getInitialState();

const selectOptionsLoadingFlag = (): Selector<RootState<IInitialState>, boolean> =>
    createSelector(
        selectOptionsContainerState,
        state => Object.values(state.loading).some(isLoading => isLoading),
    );

const selectOptionsErrorsFlag = (): Selector<RootState<IInitialState>, boolean> =>
    createSelector(
        selectOptionsContainerState,
        state => Object.values(state.errors).some(hasError => hasError),
    );

const selectAtomicId = (): Selector<RootState<IInitialStateOptions>, IInitialStateOptions['atomicId']> =>
    createSelector(selectOptionsContainerState, state => state.atomicId);

const selectDevicePayload = (): Selector<RootState<IInitialStateOptions>, HardwareDetailGroupResponse | null> =>
    createSelector(
        selectOptionsContainerState,
        state => state.devicePayload || null,
    );

const selectCurrentColor = (): Selector<RootState<IInitialStateOptions>, IInitialStateOptions['currentColor']> =>
    createSelector(selectOptionsContainerState, state => state.currentColor);

const selectCurrentCapacity = (): Selector<RootState<IInitialStateOptions>, IInitialStateOptions['currentCapacity']> =>
    createSelector(selectOptionsContainerState, state => state.currentCapacity);

const selectColors = (): Selector<RootState<IInitialStateOptions>, Color[] | null> =>
    createSelector(
        selectDevicePayload(),
        devicePayload => {
            if (!devicePayload) {
                return null;
            }

            return devicePayload.data.colors;
        },
    );

const selectCapacities = (): Selector<RootState<IInitialStateOptions>, Capacity[] | null> =>
    createDeepEqualSelectorOutput(
        selectDevicePayload(),
        devicePayload => {
            if (!devicePayload?.data.capacities) {
                return null;
            }

            return devicePayload.data.capacities.map(capacity => ({
                ...capacity,
            })).sort((capacityA, capacityB) => capacityA.sortValue - capacityB.sortValue);
        },
    );

const selectDeviceName = (): Selector<RootState<IInitialStateOptions>, StateProps['deviceName'] | null> =>
    createSelector(selectDevicePayload(), devicePayload => devicePayload && devicePayload.data?.modelName);

const selectAtomicDevices = (): Selector<RootState<IInitialStateOptions>, HardwareDetailGroupResponse['data']['atomics']> =>
    createSelector(
        selectDevicePayload(),
        devicePayload => devicePayload?.data.atomics || [],
    );

const selectImages = (): Selector<RootState<IInitialStateOptions>, string[] | null> =>
    createDeepEqualSelectorOutput(
        selectAtomicDevice(),
        atomic => atomic?.imageList.href || null,
    );

const selectCapacitiesForColor = (): Selector<RootState<IInitialStateOptions>, Capacity[] | null> =>
    createDeepEqualSelectorOutput(
        selectDevicePayload(),
        selectCurrentColor(),
        (devicePayload, currentColor) => {
            if (!devicePayload) {
                return null;
            }

            if (!currentColor) {
                return devicePayload.data.capacities!;
            }

            const items: Capacity[] = [];

            for (const atomic of devicePayload.data.atomics) {
                if (currentColor.displayLabel === atomic.color.displayLabel) {
                    items.push(atomic.capacity);
                }
            }

            return items;
        },
    );

const selectSizesForColor = (): Selector<RootState<IInitialStateOptions>, Capacity[] | null> =>
    createDeepEqualSelectorOutput(
        selectDevicePayload(),
        selectCurrentColor(),
        (devicePayload, currentColor) => {
            if (!devicePayload) {
                return null;
            }

            if (!currentColor) {
                return devicePayload.data.capacities!;
            }

            const items: Capacity[] = [];

            for (const atomic of devicePayload.data.atomics) {
                if (currentColor.displayLabel === atomic.color.displayLabel) {
                    items.push(atomic.capacity);
                }
            }

            return items;
        },
    );

const selectAtomicDevice = (): Selector<RootState<IInitialStateOptions>, HardwareDetailGroupResponse['data']['atomics'][number] | null> =>
    createSelector(
        selectAtomicId(),
        selectDevicePayload(),
        (atomicId, devicePayload) => {
            if (!devicePayload) {
                return null;
            }

            return devicePayload.data.atomics
                .find(atomic => atomicId ? atomic.hardwareId === atomicId : atomic.defaultAtomicDevice) || null;
        },
    );

const selectTechnicalDetails = (): Selector<RootState<IInitialState & IInitialStateApp>, Record<string, {
    attributes: Record<string, string>;
    id: string;
}> | null> =>
    createDeepEqualSelectorInput(
        selectDeviceAndAtomicAttributeGroups(),
        deviceAndAtomicAttributes => {
            if (!deviceAndAtomicAttributes) {
                return null;
            }

            const attributeGroupIdWhitelist = Object.keys(window[ADDITIONAL_PAGE_OPTIONS].technicalDetails.icons);
            const { attributeValues } = window[ADDITIONAL_PAGE_OPTIONS].vlux;
            const getReadableAttributeValueOptions = {
                yesValue: attributeValues.yes,
                noValue: attributeValues.no,
            };

            return getTechnicalDetails(
                attributeGroupIdWhitelist,
                deviceAndAtomicAttributes,
                getReadableAttributeValueOptions,
            );
        },
    );

const selectDeviceAndAtomicAttributeGroups = (): Selector<RootState<IInitialStateOptions & IInitialStateApp>, [AttributeGroup[], AttributeGroup[]] | null> =>
    createSelector(
        selectDevicePayload(),
        selectAtomicId(),
        selectAtomicDevices(),
        (devicePayload, atomicId, atomicDevices) => {
            if (!devicePayload || !atomicId || !atomicDevices) {
                return null;
            }

            const deviceAttributeGroups = devicePayload.data.attributeGroups;
            const atomicAttributesGroups = atomicDevices
                .filter(atomicDevice => atomicDevice.hardwareId === atomicId)
                .map(atomicDevice => atomicDevice.attributeGroups)[0];

            return [deviceAttributeGroups, atomicAttributesGroups];
        },
    );

const selectDeliveryScope = (): Selector<RootState<IInitialStateOptions & IInitialStateApp>, string[] | null> =>
    createDeepEqualSelectorInput(
        selectDevicePayload(),
        selectAtomicDevice(),
        (devicePayload, atomicDevice) => {
            if (!devicePayload || !atomicDevice) {
                return [];
            }

            const { attributeIds, attributeGroupIds } = window[ADDITIONAL_PAGE_OPTIONS].vlux;

            const deliveryScope = [atomicDevice, devicePayload.data]
                .flatMap(item => (
                    item.attributeGroups
                        .find(attributeGroup => attributeGroup.id === attributeGroupIds.characteristics)?.attributes
                        .find(attribute => attribute.uniqueIdentifier === attributeIds.deliveryScope)?.values
                    || [])
                    .toSorted((valueA, valueB) => valueA.sortOrder - valueB.sortOrder)
                    .map(value => value.value),
                );

            return deliveryScope;
        },
    );

const selectShippingInfo = (): Selector<RootState<IInitialStateOptions>, HardwareDetailGroupResponse['data']['atomics'][number]['shippingInfo'] | false> =>
    createSelector(selectAtomicDevice(), atomic => atomic ? atomic.shippingInfo : false);

const selectCellular = (): Selector<RootState<IInitialStateOptions>, HardwareDevice['promotionAttribute']['cellular'] | null> =>
    createSelector(
        selectDevicePayload(),
        devicePayload => devicePayload?.data?.promotionAttribute.cellular || null,
    );

export {
    selectOptionsContainerState,
    selectOptionsLoadingFlag,
    selectOptionsErrorsFlag,
    selectAtomicId,
    selectCapacities,
    selectCurrentColor,
    selectCurrentCapacity,
    selectColors,
    selectCapacitiesForColor,
    selectSizesForColor,
    selectDeviceName,
    selectDevicePayload,
    selectAtomicDevices,
    selectImages,
    selectTechnicalDetails,
    selectDeviceAndAtomicAttributeGroups,
    selectDeliveryScope,
    selectShippingInfo,
    selectAtomicDevice,
    selectCellular,
};
