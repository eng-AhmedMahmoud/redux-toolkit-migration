import { convertTariffsFromApiToTariffOptionPickerItems } from '../convertTariffsFromApiToTariffOptionPickerItems';
import { TariffWithHardwareOffer } from '@vfde-sails/glados-v2';
import {
    ADDITIONAL_PAGE_OPTIONS,
    SALESCHANNEL_YOUNG,
} from '@vfde-sails/constants';

describe('convertTariffsFromApiToTariffOptionPickerItems', () => {
    const mockOffers = [
        {
            cheapest: false,
            discount: {
                dataVolume: [],
                monetary: [
                    {
                        gross: -15,
                        displayLabel:
                            'Tauschbonus: 15 € Rabatt pro Monat. 12 Monate lang. Gilt ab dem Verkauf Deines alten Handys.',
                        discountId: '10439',
                        mandatory: false,
                    },
                    {
                        gross: -10,
                        displayLabel: 'GIGAKOMBI: Jeden Monat 10 € geschenkt.',
                        discountId: '177',
                        mandatory: false,
                    },
                ],
            },
            dataVolume: {
                withoutDiscounts: {
                    recurrenceStart: 1,
                    recurrenceEnd: 24,
                    value: 280,
                    unit: 'GB',
                    unlimited: false,
                },
            },
            prices: {
                hardware: {
                    onetime: {
                        withoutDiscounts: {
                            recurrenceUnit: 'onetime',
                            recurrenceStart: 1,
                            recurrenceEnd: 1,
                            gross: 1349.9,
                            net: 1134.37,
                        },
                    },
                },
                composition: {
                    insurance: {
                        month: {
                            withoutDiscounts: {
                                recurrenceUnit: 'month',
                                recurrenceStart: 1,
                                gross: 9.99,
                            },
                        },
                    },
                    tariff: {
                        month: {
                            withoutDiscounts: {
                                recurrenceUnit: 'month',
                                recurrenceStart: 1,
                                recurrenceEnd: 24,
                                gross: 89.99,
                            },
                            withDiscounts: [
                                {
                                    recurrenceUnit: 'month',
                                    recurrenceStart: 1,
                                    recurrenceEnd: 12,
                                    gross: 64.99,
                                },
                                {
                                    recurrenceUnit: 'month',
                                    recurrenceStart: 13,
                                    recurrenceEnd: 24,
                                    gross: 79.99,
                                },
                            ],
                        },
                    },
                    hardware: {
                        onetime: {
                            withoutDiscounts: {
                                recurrenceUnit: 'onetime',
                                recurrenceStart: 1,
                                recurrenceEnd: 1,
                                gross: 99.9,
                                net: 83.95,
                            },
                        },
                        month: {
                            withoutDiscounts: {
                                recurrenceUnit: 'month',
                                recurrenceStart: 1,
                                recurrenceEnd: 24,
                                gross: 40,
                            },
                        },
                    },
                },
            },
            virtualItemId: '141',
            legacyGroupId: '10343',
            tariffId: '10367',
            tariffName: 'GigaMobil Young L',
            salesChannel: 'Online.Young',
            financingType: 'sub',
        },
    ];

    beforeEach(() => {
        (window as any)[ADDITIONAL_PAGE_OPTIONS] = {
            optionPicker: {},
        };
    });

    it('should return undefined if offers are not provided', () => {
        const result = convertTariffsFromApiToTariffOptionPickerItems({});
        expect(result).toEqual([]);
    });

    it('should convert offers to IOptionPickerTextItem array', () => {
        const result = convertTariffsFromApiToTariffOptionPickerItems({
            salesChannel: SALESCHANNEL_YOUNG,
            subscriptionId: '139',
            offers: mockOffers as unknown as TariffWithHardwareOffer[],
        });

        expect(result).toEqual([
            {
                'stdValue': '141',
                'stdPrimaryLabel': 'Young L',
                'stdSecondaryLabel': '280 GB',
                'optChecked': false,
                'optDisabled': false,
            },
        ]);
    });
});
