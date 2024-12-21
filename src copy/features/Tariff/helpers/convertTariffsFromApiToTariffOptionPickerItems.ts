import { IOptionPickerTextItem } from '@vfde-brix/ws10/option-picker';
import { StateProps } from '../interfaces/interface';
import {
    getTariffOptionPickerInfo,
    truncateGigaMobileFromYoungTariffName,
} from '../../../helpers/tariffOptionPickerHelpers';

/**
 * Rendering Tariffs dynamically from API by Converting Tariffs data to Tariff option picker items
 */
export const convertTariffsFromApiToTariffOptionPickerItems = (
    { salesChannel, subscriptionId, offers }: Partial<StateProps>,
): IOptionPickerTextItem[] | undefined => {
    const items: IOptionPickerTextItem[] = [];

    if (offers) {
        for (const [index, offer] of offers.entries()) {
            const optChecked = subscriptionId === offer.virtualItemId || index === 0;

            items.push({
                stdValue: `${offer.virtualItemId}`,
                stdPrimaryLabel: truncateGigaMobileFromYoungTariffName(salesChannel, `${offer.tariffName}`),
                stdSecondaryLabel: getTariffOptionPickerInfo(offer),
                optChecked,
                optDisabled: false,
            });
        }
    }

    items.forEach(item => {
        item.optChecked = !!subscriptionId && item.stdValue === subscriptionId;
    });

    return items;
};
