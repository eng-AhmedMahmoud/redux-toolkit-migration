import {
    Color,
    Capacity,
    Cellular,
    HardwareDetailGroupResponse,
} from '@vfde-sails/glados-v2';

/**
 * Interface for initial state
 */
export interface optionsState {
  /**
   * Loading flags per API
   */
  loading: {
    getHardwareDetailGroup: boolean;
  };
  /**
   * Error flags per API
   */
  errors: {
    getHardwareDetailGroup: boolean;
  };
  /**
   * Device payload
   */
  devicePayload: HardwareDetailGroupResponse | null;
  /**
   * Current color
   */
  currentColor: Color | null;
  /**
   * Current capacity
   */
  currentCapacity: Capacity | null;
  /**
   * Atomic ID of selected device
   */
  atomicId: string | null;
  /**
   * ActiveAccordionItemId for the technical details accordion.
   * As the accordion is updated on every atomic change any opened item would be closed.
   * This property is used to store the ID of the last opened item and re-open it on update.
   */
  activeAccordionItemId: string | null;
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
