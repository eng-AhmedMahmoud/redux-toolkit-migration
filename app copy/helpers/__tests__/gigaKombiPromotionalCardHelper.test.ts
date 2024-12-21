
import {
    getGigaKombiOfferPrice,
    getGigaKombiPromotionCardProperties,
    getGigaKombiPromotionCardTxtSublabel,
    getMatchedDataVolumes,
    getMatchedMonetary,
    getTotalDataVolume,
} from 'Helper/gigaKombiPromotionalCardHelper';
import replaceCMSPlaceholder from 'Helper/replaceCMSPlaceholder';
import { IPromotionalCardProperties } from '@vfde-brix/ws10/promotional-card';
import {
    ADDITIONAL_PAGE_OPTIONS,
    GIGAKOMBI_IP_TV,
    GigakombiType,
    SAILS_PAGE_OPTIONS,
    SAILS_PARAM_CUSTOMER,
    SAILS_VVL_STORAGE,
    SALESCHANNEL_CONSUMER,
} from '@vfde-sails/constants';
import {
    Customer,
    getSessionStorageItemJson,
} from '@vfde-sails/storage';
import { AdditionalPageOptions } from 'app/container/App/interfaces/additionalPageOptions';
import {
    DataVolumeUnit,
    Discount,
} from '@vfde-sails/glados-v2';
import { getGigakombiDiscountSocs } from '@vfde-sails/page-options';
const { sailsPageOptions } = require('@vfde-sails/page-options/fixtures');

jest.mock('@vfde-sails/storage', () => ({
    getSessionStorageItemJson: jest.fn().mockImplementation(() => null),
}));

const mockPromotionalCardFromCms: Pick<AdditionalPageOptions, 'promotionalCard'> = {
    promotionalCard: {
        gigaKombiOffer: {
            stdId: 'gigakombi-{{gkCase}',
            stdIcon: 'unlocked-rewards',
            stdLabel: 'GigaKombi Vorteil',
            txtSublabelOffer: '{{offerPrice}} € Rabatt pro Monat und {{extraGB}} GB Extra-Datenvolumen.<sup>4</sup>',
            txtSublabelUnlimitedOffer: '{{offerPrice}} € Rabatt pro Monat und unbegrenztes Datenvolumen.',
            txtSublabelPriceOffer: '{{offerPrice}} € Rabatt pro Monat',
            shouldBeHiddenWith: {
                ip: ['gigamobile-promo-1'],
                iptv: ['gigamobile-promo-2'],
                tv: [],
                br5: [],
            },
        },
    },
};

const tariffDiscountFromApi: Discount | null = {
    'dataVolume': [
        {
            'value': -1,
            'displayLabel': 'GigaKombi-Vorteil: Unbegrenztes Datenvolumen',
            'discountId': '2246',
            'unit': DataVolumeUnit.GB,
        },
        {
            'value': 25,
            'displayLabel': 'AKTION: Jeden Monat 25 GB extra f&#252;r die gesamte Vertragslaufzeit',
            'discountId': '10040',
            'unit': DataVolumeUnit.GB,
        },
        {
            'value': 200,
            'displayLabel': 'AKTION: Dauerhaft 200 GB Datenvolumen geschenkt',
            'discountId': '10256',
            'unit': DataVolumeUnit.GB,
        },
    ],
    'monetary': [
        {
            'displayLabel': 'GigaKombi-Rabatt: Jeden Monat 10 € geschenkt',
            'gross': -10,
            'discountId': '177',
        },
        {
            'displayLabel': 'AKTION: Jeden Monat 25 GB extra f&#252;r die gesamte Vertragslaufzeit',
            'gross': 0,
            'discountId': '10040',
        },
        {
            'displayLabel': 'GigaKombi-Vorteil: Unbegrenztes Datenvolumen',
            'gross': 0,
            'discountId': '2246',
        },
        {
            'displayLabel': 'AKTION: Dauerhaft 200 GB Datenvolumen geschenkt',
            'gross': 0,
            'discountId': '10256',
        },
    ],
};

const customer: Partial<Customer> = {
    gigakombiType: GIGAKOMBI_IP_TV,
    isGigakombiEligible: true,
};

describe('gigakombiPromotionCardHelper', () => {
    let gigakombiSocs: string[] = [];
    let promotionalCard;
    const gigakombiType = customer.gigakombiType as GigakombiType;
    let gigaKombiOffer: any;

    beforeEach(() => {
        window[ADDITIONAL_PAGE_OPTIONS] = mockPromotionalCardFromCms as AdditionalPageOptions;
        (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => ({
            [SAILS_PARAM_CUSTOMER]: customer,
        }));
        window[SAILS_PAGE_OPTIONS] = sailsPageOptions;
        gigakombiSocs = getGigakombiDiscountSocs(SALESCHANNEL_CONSUMER, undefined, gigakombiType);
        promotionalCard = (window as any).additionalPageOptions.promotionalCard;
        gigaKombiOffer = promotionalCard!.gigaKombiOffer!;
    });

    afterAll(() => {
        window[ADDITIONAL_PAGE_OPTIONS] = {} as AdditionalPageOptions;
        sessionStorage.removeItem(SAILS_VVL_STORAGE);
        (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => null);
    });

    describe('getMatchedDataVolumes', () => {

        it('should not get matched data volumes', () => {

            expect(getMatchedDataVolumes(null, gigakombiSocs).length).toEqual(0);
        });
        it('should get one matched data volume', () => {

            expect(getMatchedDataVolumes(tariffDiscountFromApi, gigakombiSocs)?.length).toEqual(1);
        });
    });

    describe('getMatchedMonetary', () => {

        it('should not get matched data monetary', () => {
            expect(getMatchedMonetary(null, gigakombiSocs).length).toEqual(0);
        });
        it('should get two matched data monetary', () => {

            expect(getMatchedDataVolumes(tariffDiscountFromApi, gigakombiSocs)).toBeTruthy();
            expect(getMatchedMonetary(tariffDiscountFromApi, gigakombiSocs)?.length).toEqual(2);
        });

    });

    describe('getGigaKombiOfferPrice', () => {

        it('should get giga kombi offer price from  data monetary', () => {
            expect(getGigaKombiOfferPrice(tariffDiscountFromApi, gigakombiSocs)).toEqual(10);
        });
        it('should not get giga kombi offer price from data monetary', () => {

            expect(getGigaKombiOfferPrice({ ...tariffDiscountFromApi, monetary: [] }, gigakombiSocs)).not.toBeTruthy();
        });
    });

    describe('getTotalDataVolume', () => {

        it('should get total data volumes equal to zero ', () => {

            expect(getTotalDataVolume({ ...tariffDiscountFromApi, dataVolume: [] }, gigakombiSocs)).toEqual(0);
        });
        it('should get total data volumes equal -1 unlimited', () => {

            expect(getTotalDataVolume(tariffDiscountFromApi, gigakombiSocs)).toEqual(-1);
        });
    });

    describe('getGigaKombiPromotionCardTxtSublabel', () => {

        it('should get txtSublabelOffer text', () => {
            const updatedTariffDiscount = JSON.parse(JSON.stringify(tariffDiscountFromApi));
            updatedTariffDiscount.dataVolume.push({
                'value': 4,
                'displayLabel': 'GigaKombi-Vorteil',
                'discountId': '2619',
                'unit': DataVolumeUnit.GB,
            });
            const dataVolume = getTotalDataVolume(updatedTariffDiscount, gigakombiSocs);
            const offerPrice = getGigaKombiOfferPrice(updatedTariffDiscount, gigakombiSocs);
            const expected = replaceCMSPlaceholder(gigaKombiOffer.txtSublabelOffer, {
                offerPrice: (offerPrice || 0).toString(),
                extraGB: dataVolume.toString(),
            });

            expect(getGigaKombiPromotionCardTxtSublabel(updatedTariffDiscount, offerPrice, gigakombiSocs, true))
                .toEqual(expected);
        });

        it('should get txtSublabelOffer text with no GB', () => {
            const updatedTariffDiscount = JSON.parse(JSON.stringify(tariffDiscountFromApi));
            updatedTariffDiscount.dataVolume.push({
                'value': 4,
                'displayLabel': 'GigaKombi-Vorteil',
                'discountId': '2619',
                'unit': DataVolumeUnit.GB,
            });
            const offerPrice = getGigaKombiOfferPrice(updatedTariffDiscount, gigakombiSocs);
            const expected = replaceCMSPlaceholder(gigaKombiOffer.txtSublabelOffer, {
                offerPrice: (offerPrice || 0).toString(),
                extraGB: '',
            });

            expect(getGigaKombiPromotionCardTxtSublabel(updatedTariffDiscount, offerPrice, gigakombiSocs, false))
                .toEqual(expected);
        });

        it('should get txtSublabelPriceOffer text', () => {
            const updatedTariffDiscount = JSON.parse(JSON.stringify(tariffDiscountFromApi));
            updatedTariffDiscount.dataVolume.push({
                'value': 1,
                'displayLabel': 'GigaKombi-Vorteil',
                'discountId': '2619',
                'unit': DataVolumeUnit.GB,
            });
            const offerPrice = getGigaKombiOfferPrice(updatedTariffDiscount, gigakombiSocs);
            const expected = replaceCMSPlaceholder(gigaKombiOffer.txtSublabelPriceOffer, {
                offerPrice: (offerPrice || 0).toString(),
            });
            expect(getGigaKombiPromotionCardTxtSublabel(updatedTariffDiscount, offerPrice, gigakombiSocs, true))
                .toEqual(expected);
        });

        it('should get txtSublabelUnlimitedOffer text ', () => {
            const offerPrice = getGigaKombiOfferPrice(tariffDiscountFromApi, gigakombiSocs);
            const expected = replaceCMSPlaceholder(gigaKombiOffer.txtSublabelUnlimitedOffer, {
                offerPrice: (offerPrice || 0).toString(),
            });
            expect(getGigaKombiPromotionCardTxtSublabel(tariffDiscountFromApi, offerPrice, gigakombiSocs, true))
                .toEqual(expected);
        });
    });

    describe('getGigaKombiPromotionCardProperties', () => {

        it('should get getGigaKombiPromotionCardProperties', () => {
            const offerPrice = getGigaKombiOfferPrice(tariffDiscountFromApi, gigakombiSocs);
            const expected: IPromotionalCardProperties = {
                ...gigaKombiOffer,
                txtSublabel: getGigaKombiPromotionCardTxtSublabel(tariffDiscountFromApi, offerPrice, gigakombiSocs, true),
                shouldBeHiddenWith: gigaKombiOffer.shouldBeHiddenWith[gigakombiType] || [],
            };
            const promotionCardProperties = getGigaKombiPromotionCardProperties(tariffDiscountFromApi, offerPrice, gigakombiSocs, gigakombiType, true);

            expect(promotionCardProperties).toEqual(expected);
        });

        it('should get getGigaKombiPromotionCardProperties with empty hidden with array', () => {
            const editMockPromotionalCardFromCms: Pick<AdditionalPageOptions, 'promotionalCard'> = {
                promotionalCard: {
                    gigaKombiOffer: {
                        ...mockPromotionalCardFromCms.promotionalCard.gigaKombiOffer,
                        shouldBeHiddenWith: [],
                    },
                },
            };
            window[ADDITIONAL_PAGE_OPTIONS] = editMockPromotionalCardFromCms as AdditionalPageOptions; const offerPrice = getGigaKombiOfferPrice(tariffDiscountFromApi, gigakombiSocs);
            const expected: IPromotionalCardProperties = {
                ...gigaKombiOffer,
                txtSublabel: getGigaKombiPromotionCardTxtSublabel(tariffDiscountFromApi, offerPrice, gigakombiSocs, true),
                shouldBeHiddenWith: [],
            };
            const promotionCardProperties = getGigaKombiPromotionCardProperties(tariffDiscountFromApi, offerPrice, gigakombiSocs, gigakombiType, true);
            expect(promotionCardProperties).toEqual(expected);
        });

        it('should not return gigakombi promotional card properties', () => {
            const tariffDiscount = { dataVolume: [], monetary: [] };
            const offerPrice = getGigaKombiOfferPrice(tariffDiscount, gigakombiSocs);
            const promotionCardProperties = getGigaKombiPromotionCardProperties(tariffDiscount, offerPrice, gigakombiSocs, gigakombiType, true);

            expect(promotionCardProperties)
                .toBeUndefined();
        });

    });
});
