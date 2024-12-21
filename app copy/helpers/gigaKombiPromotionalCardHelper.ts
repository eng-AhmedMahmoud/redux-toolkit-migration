
import { GigakombiType } from '@vfde-sails/constants';
import replaceCMSPlaceholder from './replaceCMSPlaceholder';
import formatDataVolume from './dataVolumeHelper';
import {
    Discount,
    DiscountDataVolume,
    DiscountMonetary,
} from '@vfde-sails/glados-v2';
import { PromotionalCardProps } from 'Container/Tariff/interface';

/**
 * Get Matched DataVolumes
 * @param tariffDiscount - tariff discounts
 * @param discountIds - discountIds from Api
 */
export const getMatchedDataVolumes = (
    tariffDiscount: Discount | null, discountIds: string[]): DiscountDataVolume[] => {

    const matchedDataVolumes = (tariffDiscount?.dataVolume || []).filter(element => discountIds.includes(element.discountId));

    return matchedDataVolumes;

};

/**
 * Get Matched Monetary
 * @param tariffDiscount - tariff discounts
 * @param discountIds - discountIds from Api
 */
export const getMatchedMonetary = (tariffDiscount: Discount | null, discountIds: string[]): DiscountMonetary[] => {

    const matchedMonetary = (tariffDiscount?.monetary || []).filter(element => discountIds.includes(element.discountId));

    return matchedMonetary;
};

/**
 * Get GigaKombi Offer Price
 * @param tariffDiscount - tariff discounts
 * @param discountIds - discountIds from Api
 */
export const getGigaKombiOfferPrice = (
    tariffDiscount: Discount | null,
    discountIds: string[],
): number => {
    const matchedMonetary = getMatchedMonetary(tariffDiscount, discountIds);

    const offerPrice = matchedMonetary.reduce(
        (prev, { gross }) => prev + Math.abs(gross),
        0,
    );

    return offerPrice;
};

/**
 * Get GigaKombi dataVolume based on api response
 * @param tariffDiscount - tariff discounts
 * @param discountIds - discountIds from Api
 */
export const getTotalDataVolume = (tariffDiscount: Discount | null, discountIds: string[]): number => {
    const matchedDataVolumes = getMatchedDataVolumes(tariffDiscount, discountIds);

    const totalDataVolume = matchedDataVolumes.reduce((prev, { value }) => prev + value, 0);

    return totalDataVolume;
};

/**
 * Get GigaKombi promotion card properties
 * @param tariffDiscount - tariff discounts
 * @param offerPrice - offerPrice  calculated from summation monetary
 * @param discountIds - discountIds from Api
 * @param extraGB - extraGB  flag
 */
export const getGigaKombiPromotionCardTxtSublabel = (
    tariffDiscount: Discount | null,
    offerPrice: number,
    discountIds: string[],
    extraGB?: boolean | null,
): string => {
    const dataVolume = getTotalDataVolume(tariffDiscount, discountIds);
    const { promotionalCard } = (window as any).additionalPageOptions;
    const gigaKombiOffer = promotionalCard?.gigaKombiOffer;
    const { txtSublabelPriceOffer, txtSublabelOffer, txtSublabelUnlimitedOffer } = gigaKombiOffer;

    // check data volume value if equal zero display promotional card text with offer price only
    if (dataVolume === 0) {
        return replaceCMSPlaceholder(txtSublabelPriceOffer, {
            offerPrice: offerPrice.toString(),
        });
    }
    // check data volume value if more than zero display promotional card text with offer price and extra GB

    if (dataVolume > 0) {
        return replaceCMSPlaceholder(txtSublabelOffer, {
            offerPrice: offerPrice.toString(),
            extraGB: extraGB ? formatDataVolume(dataVolume.toString()) : '',
        });
    }
    //  data volume value less than zero display promotional card text with offer price and unlimited data volumes

    return replaceCMSPlaceholder(txtSublabelUnlimitedOffer, {
        offerPrice: offerPrice.toString(),
    });

};

/**
 * Get GigaKombi promotion card properties
 * @param tariffDiscount - tariff discounts
 * @param offerPrice - offerPrice  calculated from sumition monetary
 * @param discountIds - discountIds from Api
 * @param gigakombiType - gigakombiType  type of giga Kombi user
 * @param extraGB - extraGB  flag
 */
export const getGigaKombiPromotionCardProperties = (
    tariffDiscount: Discount | null,
    offerPrice: number,
    discountIds: string[],
    gigakombiType: GigakombiType,
    extraGB?: boolean | null,
): PromotionalCardProps | undefined => {

    const matchedDataVolumes = getMatchedDataVolumes(tariffDiscount, discountIds);
    const matchedMonetary = getMatchedMonetary(tariffDiscount, discountIds);
    const { promotionalCard } = (window as any).additionalPageOptions;
    const gigaKombiOffer = promotionalCard.gigaKombiOffer;

    if ((!matchedDataVolumes.length && !matchedMonetary.length) || !gigaKombiOffer) {
        return;
    }

    const gigakombiPromotionalCardProps: PromotionalCardProps = {
        ...gigaKombiOffer,
        stdId: replaceCMSPlaceholder(gigaKombiOffer.stdId, {
            gkCase: gigakombiType,
        }),
        txtSublabel: getGigaKombiPromotionCardTxtSublabel(tariffDiscount, offerPrice, discountIds, extraGB),
        shouldBeHiddenWith: gigaKombiOffer?.shouldBeHiddenWith[gigakombiType] || [],
    };

    return gigakombiPromotionalCardProps;
};
