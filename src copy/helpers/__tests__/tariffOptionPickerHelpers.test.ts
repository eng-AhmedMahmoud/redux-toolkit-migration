import {
    ADDITIONAL_PAGE_OPTIONS,
    SALESCHANNEL_CONSUMER,
    SALESCHANNEL_REDPLUS,
    RED_L_VIRTUAL_ID,
    RED_M_VIRTUAL_ID,
    RED_S_VIRTUAL_ID,
    RED_XL_VIRTUAL_ID,
    RED_XS_VIRTUAL_ID,
    YOUNG_L_VIRTUAL_ID,
    YOUNG_M_VIRTUAL_ID,
    YOUNG_S_VIRTUAL_ID,
    YOUNG_XL_VIRTUAL_ID,
    SALESCHANNEL_YOUNG,
} from '@vfde-sails/constants';
import {
    getAllSubscriptionIdsFromCms,
    getSubscriptionIdsFromCms,
    getTariffOptionPickerInfo,
    truncateGigaMobileFromYoungTariffName,
} from '../tariffOptionPickerHelpers';
import {
    DataVolumeUnit,
    TariffWithHardwareOffer,
} from '@vfde-sails/glados-v2';

const offers = [
    {
        'dataVolume': {
            'withoutDiscounts': {
                'recurrenceStart': 1,
                'recurrenceEnd': 24,
                'value': -1,
                'unit': DataVolumeUnit.GB,
                'unlimited': true,
            },
        },
    },
    {
        'dataVolume': {
            'withoutDiscounts': {
                'recurrenceStart': 1,
                'recurrenceEnd': 24,
                'value': 25.0,
                'unit': DataVolumeUnit.GB,
                'unlimited': false,
            },
            'withDiscounts': [
                {
                    'recurrenceStart': 1,
                    'recurrenceEnd': 24,
                    'value': 15.0,
                    'unit': DataVolumeUnit.GB,
                    'unlimited': false,
                },
            ],
        },
    },
    {
        'dataVolume': {
            'withoutDiscounts': {
                'recurrenceStart': 1,
                'recurrenceEnd': 24,
                'value': 25.0,
                'unit': DataVolumeUnit.GB,
                'unlimited': false,
            },
            'withDiscounts': [
                {
                    'recurrenceStart': 1,
                    'recurrenceEnd': 24,
                    'value': -1,
                    'unit': DataVolumeUnit.GB,
                    'unlimited': false,
                },
            ],
        },
    },
] as TariffWithHardwareOffer[];

const youngS = {
    'dataVolume': {
        'withoutDiscounts': {
            'recurrenceStart': 1,
            'recurrenceEnd': 24,
            'value': 50.0,
            'unit': DataVolumeUnit.GB,
            'unlimited': false,
        },
    },
} as TariffWithHardwareOffer;

const unlimitedOffer = offers.find((offer: TariffWithHardwareOffer) => offer.dataVolume.withoutDiscounts?.unlimited);

describe('tariffOptionPickerHelpers', () => {
    beforeEach(() => {
        (window as any)[ADDITIONAL_PAGE_OPTIONS] = {
            optionPicker: {
                tariffInfo: '{{dataWithdiscountData}} <br> statt {{dataWithoutDiscount}}',
                unlimitedTariffInfo: 'Unbegrenzt',
                subscriptionIds: {
                    consumer: [
                        RED_XS_VIRTUAL_ID,
                        RED_S_VIRTUAL_ID,
                        RED_M_VIRTUAL_ID,
                        RED_L_VIRTUAL_ID,
                        RED_XL_VIRTUAL_ID,
                    ],
                    young: [
                        YOUNG_S_VIRTUAL_ID,
                        YOUNG_M_VIRTUAL_ID,
                        YOUNG_L_VIRTUAL_ID,
                        YOUNG_XL_VIRTUAL_ID,
                    ],
                    default: {
                        consumer: RED_M_VIRTUAL_ID,
                        young: YOUNG_M_VIRTUAL_ID,
                    },
                },
            },
        };
    });

    describe('truncateGigaMobileFromYoungTariffName', () => {
        it('should return the original string if sales channel is not YOUNG', () => {
            const testString = 'Super Data Plan';
            const salesChannel = 'consumer'; // Or any other non-YOUNG value

            const result = truncateGigaMobileFromYoungTariffName(salesChannel, testString);

            expect(result).toBe(testString);
        });

        it('should remove "GigaMobil" from the string if sales channel is YOUNG', () => {
            const testString = 'GigaMobil Super Plan';
            const salesChannel = SALESCHANNEL_YOUNG;

            const expectedResult = 'Super Plan';
            const result = truncateGigaMobileFromYoungTariffName(salesChannel, testString);

            expect(result).toBe(expectedResult);
        });

        it('should handle strings without "GigaMobil"', () => {
            const testString = 'Basic Mobile Plan';
            const salesChannel = SALESCHANNEL_YOUNG;

            const result = truncateGigaMobileFromYoungTariffName(salesChannel, testString);

            expect(result).toBe(testString);
        });

    });
    describe('getTariffOptionPickerInfo', () => {
        it('should get TariffInfo with discounted and non-discounted data', () => {
            const dataWithdiscountData = offers[1].dataVolume.withDiscounts && offers[1].dataVolume.withDiscounts[0]?.value?.toString().concat(` ${offers[1].dataVolume.withDiscounts[0]?.unit}`);
            const dataWithoutDiscount = offers[1].dataVolume.withoutDiscounts && offers[1].dataVolume.withoutDiscounts?.value?.toString().concat(` ${offers[1].dataVolume.withoutDiscounts?.unit}`);

            expect(getTariffOptionPickerInfo(offers[1])).toEqual(
                `${dataWithdiscountData} <br> statt ${dataWithoutDiscount}`,
            );
        });

        it('should get Unlimited TariffInfo', () => {
            const { unlimitedTariffInfo } = window[ADDITIONAL_PAGE_OPTIONS].optionPicker || undefined;

            expect(getTariffOptionPickerInfo(unlimitedOffer!)).toEqual(unlimitedTariffInfo);
        });

        it('should get Unlimited TariffInfo when non-discounted data is negative one', () => {
            const { unlimitedTariffInfo } = window[ADDITIONAL_PAGE_OPTIONS].optionPicker;

            expect(getTariffOptionPickerInfo(offers[0])).toEqual(unlimitedTariffInfo);
        });

        it('should get non-discounted data if discounted data does not exist', () => {
            const dataWithoutDiscount = youngS.dataVolume.withoutDiscounts && youngS.dataVolume.withoutDiscounts?.value?.toString().concat(` ${youngS.dataVolume.withoutDiscounts?.unit}`);

            expect(getTariffOptionPickerInfo(youngS)).toEqual(`${dataWithoutDiscount}`);
        });

        it('should get Unlimited discounted data when discounted data is negative one', () => {
            const { unlimitedTariffInfo } = window[ADDITIONAL_PAGE_OPTIONS].optionPicker;
            const dataWithoutDiscount = offers[2].dataVolume.withoutDiscounts && offers[2].dataVolume.withoutDiscounts?.value?.toString().concat(` ${offers[2].dataVolume.withoutDiscounts?.unit}`);

            expect(getTariffOptionPickerInfo(offers[2])).toEqual(
                `${unlimitedTariffInfo} <br> statt ${dataWithoutDiscount}`,
            );
        });

    });

    describe('getSubscriptionIdsFromCms', () => {
        it('should get a list of Consumer subscriptionIds', () => {
            const { subscriptionIds } = window[ADDITIONAL_PAGE_OPTIONS].optionPicker;

            expect(getSubscriptionIdsFromCms(SALESCHANNEL_CONSUMER)).toEqual(subscriptionIds[SALESCHANNEL_CONSUMER]);
        });

        it('should get an empty list if there is no subscriptionIds for the used sales-channel', () => {
            expect(getSubscriptionIdsFromCms(SALESCHANNEL_REDPLUS)).toEqual([]);
        });
    });

    describe('getAllSubscriptionIdsFromCms', () => {
        it('should get a list of GigaMobil subscriptionIds', () => {
            const { subscriptionIds } = window[ADDITIONAL_PAGE_OPTIONS].optionPicker;
            const gigamobilSubscriptionIds = subscriptionIds[SALESCHANNEL_CONSUMER].concat(subscriptionIds[SALESCHANNEL_YOUNG]);

            expect(getAllSubscriptionIdsFromCms()).toEqual(gigamobilSubscriptionIds);
        });
    });

});
