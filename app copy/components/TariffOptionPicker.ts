import {
    OptionPicker,
    IOptionPickerTextItem,
    OPTION_PICKER_TYPE_TEXT,
} from '@vfde-brix/ws10/option-picker';
import {
    RedTariff,
    YoungTariff,
} from '@vfde-sails/constants';
import { StateProps } from '../container/Tariff/interface';
import { mountOptionPicker } from './OptionPicker';
import { TARIFF_OPTION_PICKER_NAME } from '../container/Tariff/constants';
import {
    getTariffOptionPickerInfo,
    truncateGigaMobileFromYoungTariffName,
} from '../helpers/tariffOptionPickerHelpers';
import { TariffActionDispatchers } from 'app/container/Tariff/slice';

/**
 * Mount Tariff Option Picker
 */
export const mountTariffOptionPicker = (containerId: string, setSubscriptionIdAction: TariffActionDispatchers['setSubscriptionId']): OptionPicker | null => {
    const items: IOptionPickerTextItem[] = [];
    const container = document.getElementById(containerId);

    const onChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        setSubscriptionIdAction(target.value as RedTariff | YoungTariff);
    };

    return container && mountOptionPicker(container, TARIFF_OPTION_PICKER_NAME, OPTION_PICKER_TYPE_TEXT, TARIFF_OPTION_PICKER_NAME, items, onChange);
};

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
