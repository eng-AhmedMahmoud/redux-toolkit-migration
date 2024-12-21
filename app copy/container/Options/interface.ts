/* eslint no-use-before-define: 0 */
import {
    Capacity,
    Cellular,
    Color,
    HardwareDetailGroupResponse,
} from '@vfde-sails/glados-v2';

/**
 * Data for initial state
 */
export interface IInitialState {
    /**
     * Loading flags per API
     */
    loading: {
        getDevice: boolean;
    };
    /**
     * Error flags per API
     */
    errors: {
        getDevice: boolean;
    };
    /**
     * Device payload
     */
    devicePayload: HardwareDetailGroupResponse | null;
    /**
     * Current selected color (first color on load)
     */
    currentColor: Color | null;
    /**
     * Current selected capacity (first size in first color on load)
     */
    currentCapacity: Capacity | null;
    /**
     * Atomic ID of selected device
     */
    atomicId: string | null;
}

/**
 * Properties of Option Container
 */
export interface StateProps {
    /**
     * Device payload
     */
    devicePayload: HardwareDetailGroupResponse | null;
    /**
     * Available colors
     */
    availableColors: Color[] | null;
    /**
     * Available capacities
     */
    availableCapacities: Capacity[] | null;
    /**
     * Available capacities for a selected color
     */
    capacitiesForColor: Capacity[] | null;
    /**
     * Current color;
     */
    currentColor: Color | null;
    /**
     * Current capacity
     */
    currentCapacity: Capacity | null;
    /**
     * Images
     */
    images: string[] | null;
    /**
     * Atomic ID
     */
    atomicId: string | null;
    /**
     * Shipping Info
     */
    shippingInfo: HardwareDetailGroupResponse['data']['atomics'][number]['shippingInfo'] | false;
    /**
     * Delivery scope
     */
    deliveryScope: string[] | null;
    /**
     * Product information
     */
    technicalDetails: {
        [key: string]: {
            attributes: Record<string, string>;
            id: string;
        };
    } | null;
    /**
     * Device name
     */
    deviceName: string | null;
    /**
     * Cellular
     */
    cellular: Cellular | null;
}
