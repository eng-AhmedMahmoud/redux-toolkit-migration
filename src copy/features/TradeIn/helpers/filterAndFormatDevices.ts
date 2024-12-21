import {
    ApiDevice,
    Device,
} from '../interfaces/api';

/**
 * Filters out zero euro devices
 * and reformats the device object structure
 */
export const filterAndFormatDevices = (devices: ApiDevice[]): Device[] => {
    const formattedDevices: Device[] = devices
        .filter(device => device.productOfferingPrice[0].price.value > 0)
        .map(device => ({
            id: device.id,
            name: device.name,
            maxPrice: device.productOfferingPrice[0].price.value,
            formattedPrice: `${device.productOfferingPrice[0].price.value} €`,
            imgSrc: device.attachment[0].url,
        }
        ));

    return formattedDevices;
};
