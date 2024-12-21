import {
    OptionPicker,
    createOptionPicker,
} from '@vfde-brix/ws10/option-picker';
import {
    SALESCHANNEL_CONSUMER,
    SALESCHANNEL_YOUNG,
    type SalesChannel,
} from '@vfde-sails/constants';
import { AppActionDispatchers } from 'app/container/App/slice';

/**
 * Mounts the switch (optionPicker) component
 * @param containerId ID of the switch container
 * @param setSalesChannelAction Callback function to be called on change (e. g. action dispatcher function)
 */
export const mountPortfolioSwitch = (containerId: string, setSalesChannelAction: AppActionDispatchers['setSalesChannel']): OptionPicker => {
    const container = document.getElementById(containerId) as HTMLElement;

    const onChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const salesChannel = target.value as Extract<SalesChannel, typeof SALESCHANNEL_CONSUMER | typeof SALESCHANNEL_YOUNG>;

        setSalesChannelAction(salesChannel);
    };

    const optionPickerComponent = container && createOptionPicker(container, { onChange });

    return optionPickerComponent;
};

/**
 * Updates the optionPicker component
 * @param salesChannelOptionPicker The optionPicker component instance
 * @param salesChannel salesChannel
 */
export const handleSalesChannelOptionPickerSelection = (
    salesChannelOptionPicker: OptionPicker,
    salesChannel: Extract<SalesChannel, typeof SALESCHANNEL_CONSUMER | typeof SALESCHANNEL_YOUNG>,
) => {
    const { items } = salesChannelOptionPicker.getProperties();

    items.forEach(item => {
        item.optChecked = false;

        if (item.stdValue === salesChannel) {
            item.optChecked = true;
        }
    });

    salesChannelOptionPicker.update({ items });
};
