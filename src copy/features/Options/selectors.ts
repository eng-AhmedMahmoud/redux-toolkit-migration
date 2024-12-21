import { createAppSelector } from '../../app/createAppSelector';
import type { RootState } from '../../app/store';
import {
    AttributeGroup,
    Capacity,
    Color,
    Cellular,
    getTechnicalDetails,
    HardwareDetailGroupResponse,
} from '@vfde-sails/glados-v2';
import { ADDITIONAL_PAGE_OPTIONS } from '@vfde-sails/constants';
import optionsSlice from './slice';
import {
    optionsState,
    StateProps,
} from './interface';

// #region Direct selectors

/**
 * Selects loading state directly from the state
 */
const selectOptionsLoadingFlag = createAppSelector(
    [(state: RootState) => state.vvlDeviceDetailsOptions.loading.getHardwareDetailGroup],
    (isLoading: boolean) => isLoading,
);

/**
 * Selects error state directly from the state
 */
const selectOptionsErrorsFlag = createAppSelector(
    [(state: RootState) => state.vvlDeviceDetailsOptions.errors.getHardwareDetailGroup],
    (hasError: boolean) => hasError,
);

/**
 * Selects current color directly from the state
 */
const selectCurrentColor = createAppSelector(
    [(state: RootState) => state.vvlDeviceDetailsOptions.currentColor],
    (currentColor: Color | null) => currentColor,
);

/**
 * Selects current capacity directly from the state
 */
const selectCurrentCapacity = createAppSelector(
    [(state: RootState) => state.vvlDeviceDetailsOptions.currentCapacity],
    (currentCapacity: Capacity | null) => currentCapacity,
);

/**
 * Selects atomic Id directly from the state
 */
const selectAtomicId = createAppSelector(
    [(state: RootState) => state.vvlDeviceDetailsOptions.atomicId],
    (atomicId: string | null) => atomicId,
);

/**
 * Selects active accordion item id directly from the state
 */
const selectActiveAccordionItemId = createAppSelector(
    [(state: RootState) => state.vvlDeviceDetailsOptions.activeAccordionItemId],
    (activeAccordionItemId: string | null) => activeAccordionItemId,
);

// #endregion

// #region Hardware selectors

/**
 * Selects the slice state
 */
const selectDeviceState = createAppSelector(
    [(state: RootState): optionsState => state.vvlDeviceDetailsOptions],
    (vvlDeviceDetailsOptions: optionsState) => vvlDeviceDetailsOptions || optionsSlice.getInitialState(),
);

/**
 * Selects the payload data
 */
const selectDevicePayload = createAppSelector(
    [selectDeviceState],
    (state: optionsState): HardwareDetailGroupResponse | null => state.devicePayload,
);

/**
 * Selects the device name
 */
const selectDeviceName = createAppSelector(
    [selectDevicePayload],
    (device: HardwareDetailGroupResponse | null): string | null => device?.data.modelName || null,
);

/**
 * Selects the device atomics
 */
const selectAtomicDevices = createAppSelector(
    [selectDevicePayload],
    (device: HardwareDetailGroupResponse | null) => device?.data.atomics || [],
);

/**
 * Selects the hardwareIds of each atomic
 */
const selectAtomicIds = createAppSelector(
    [selectAtomicDevices],
    (atomics: HardwareDetailGroupResponse['data']['atomics']) => atomics.map(atomic => atomic.hardwareId),
);

/**
 * Selects the device capacities
 */
const selectCapacities = createAppSelector(
    [selectDevicePayload],
    (device: HardwareDetailGroupResponse | null): Capacity[] =>
        device?.data.capacities?.map(capacity => ({
            ...capacity,
        })).sort((capacityA, capacityB) => capacityA.sortValue - capacityB.sortValue) || [],
);

/**
 * Selects the device colors
 */
const selectColors = createAppSelector(
    [selectDevicePayload],
    (device: HardwareDetailGroupResponse | null): Color[] => device?.data.colors || [],
);

/**
 * Selects the atomicDevice based on the current atomicId
 */
const selectAtomicDevice = createAppSelector(
    [selectDevicePayload, selectAtomicId],
    (device: HardwareDetailGroupResponse | null, atomicId: string | null) => {
        if (!device) {
            return null;
        }

        return device.data.atomics
            .find(atomic => atomicId ? atomic.hardwareId === atomicId : atomic.defaultAtomicDevice)
            || null;
    },
);

/**
 * Selects the device images
 */
const selectImages = createAppSelector(
    [selectAtomicDevice],
    atomic => atomic?.imageList.href || null,
);

/**
 * Selects the device shipping info
 */
const selectShippingInfo = createAppSelector(
    [selectAtomicDevice],
    (atomic): StateProps['shippingInfo'] => atomic ? atomic.shippingInfo : false,
);

/**
 * Selects the sizes that are available for the current color
 */
const selectCapacitiesForColor = createAppSelector(
    [selectDevicePayload, selectCurrentColor],
    (devicePayload: HardwareDetailGroupResponse | null, currentColor: Color | null): Capacity[] | null => {
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

/**
 * Selects all available colors
 */
const selectColorOptions = createAppSelector(
    [selectDevicePayload],
    (device: HardwareDetailGroupResponse | null): Color[] => device?.data.colors || [],
);

/**
 * Selects the images for the current atomic
 */
const selectAtomicImages = createAppSelector(
    [selectAtomicDevice],
    atomic => atomic?.imageList.href || null,
);

/**
 * Selects the cellular attribute of the device
 */
const selectCellular = createAppSelector(
    [selectDevicePayload],
    (device: HardwareDetailGroupResponse | null): Cellular | null =>
        device?.data.promotionAttribute.cellular || null,
);

/**
 * Selects the device and atomic attribute groups as a tuple
 */
const selectDeviceAndAtomicAttributeGroups = createAppSelector(
    [selectAtomicId, selectDevicePayload, selectAtomicDevices],
    (atomicId: string | null, device: HardwareDetailGroupResponse | null, atomics: HardwareDetailGroupResponse['data']['atomics']): [AttributeGroup[], AttributeGroup[]] | null => {
        if (!device) {
            return null;
        }

        const deviceAttributeGroups = device.data.attributeGroups;
        const atomicAttributesGroups = atomics
            .filter(atomic => atomic.hardwareId === atomicId)
            .map(atomic => atomic.attributeGroups)[0];

        return [deviceAttributeGroups, atomicAttributesGroups];
    },
);

/**
 * Selects the technical details object
 */
const selectTechnicalDetails = createAppSelector(
    [selectDeviceAndAtomicAttributeGroups],
    (deviceAndAtomicAttributes: [AttributeGroup[], AttributeGroup[]] | null): StateProps['technicalDetails'] => {
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

/**
 * Selects the deliveryScope for the current device / atomic
 */
const selectDeliveryScope = createAppSelector(
    [
        selectDevicePayload,
        selectAtomicDevice,
    ],
    (device: HardwareDetailGroupResponse | null, atomicDevice: HardwareDetailGroupResponse['data']['atomics'][number] | null): string[] => {
        if (!device || !atomicDevice) {
            return [];
        }

        const { attributeIds, attributeGroupIds } = window[ADDITIONAL_PAGE_OPTIONS].vlux;

        const deliveryScope = [atomicDevice, device.data]
            .flatMap(item => {
                const attributeGroup = item.attributeGroups
                    .find(group => group.id === attributeGroupIds.characteristics);
                const attribute = attributeGroup?.attributes
                    .find(attr => attr.uniqueIdentifier === attributeIds.deliveryScope);

                return attribute?.values || [];
            })
            .map(value => ({ value: value.value, sortOrder: value.sortOrder }))
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(item => item.value);

        return deliveryScope;
    },
);

// #endregion

export {
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
};
