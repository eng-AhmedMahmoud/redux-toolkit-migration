import { SailsVvlStorage } from '@vfde-sails/storage';
import { Device } from 'app/container/TradeIn/interfaces/api';

/**
 * SailsVVLSessionStorage structure
 */
export interface SailsDeviceDetailsStorage extends SailsVvlStorage {
    /**
     * trade in device
     */
    tradeInDevice: Device
}
