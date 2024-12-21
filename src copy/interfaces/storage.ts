import { SailsVvlStorage } from '@vfde-sails/storage';

/**
 * SailsVVLSessionStorage structure
 */
export interface SailsDeviceDetailsStorage extends SailsVvlStorage {
  /**
   * trade in device
   */
  // TODO: import Device after creating it in the tradein slice interface
  tradeInDevice: Device
}
