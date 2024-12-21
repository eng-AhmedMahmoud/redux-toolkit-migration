import { filterAndFormatDevices } from '../filterAndFormatDevices';
import {
    ApiDevice,
    Device,
} from '../../interfaces/api';

describe('Filter and format devices', () => {
    const apiDevices: ApiDevice[] = [
        {
            name: 'Test',
            id: 'r:0422',
            prodSpecCharValueUse: [
                {
                    name: 'Apple',
                    value: 'Test',
                },
            ],
            productOfferingPrice: [
                {
                    price: {
                        value: 0,
                        unit: 'EUR',
                    },
                    priceType: 'max',
                },
            ],
            attachment: [
                {
                    url: 'http://google.de',
                    name: 'image',
                },
            ],
        },
        {
            name: 'Test 2',
            id: 'r:04221',
            prodSpecCharValueUse: [
                {
                    name: 'Apple',
                    value: 'Test',
                },
            ],
            productOfferingPrice: [
                {
                    price: {
                        value: 5,
                        unit: 'EUR',
                    },
                    priceType: 'max',
                },
            ],
            attachment: [
                {
                    url: 'http://google.de',
                    name: 'image',
                },
            ],
        },
    ];

    const formatedDevice: Device[] = [
        {
            name: apiDevices[1].name,
            id: apiDevices[1].id,
            formattedPrice: `${apiDevices[1].productOfferingPrice[0].price.value} €`,
            imgSrc: apiDevices[1].attachment[0].url,
            maxPrice: apiDevices[1].productOfferingPrice[0].price.value,
        },
    ];

    it('should filter devices with 0 and return them formatted', () => {
        expect(filterAndFormatDevices(apiDevices)).toStrictEqual(formatedDevice);
    });
});
