import {
    createOptionPicker,
    IOptionPickerBusinessLogic,
    IOptionPickerItem,
    IOptionPickerProperties,
    OptionPicker,
} from '@vfde-brix/ws10/option-picker';

/**
 * Mount the option picker
 */
export const mountOptionPicker = (
    containerId: string,
    businessLogicOrProperties: IOptionPickerBusinessLogic | IOptionPickerProperties<IOptionPickerItem>,
): OptionPicker | null => {
    const container = document.getElementById(containerId);

    /* istanbul ignore if */
    if (!container) {
        return null;
    }

    return createOptionPicker(container, businessLogicOrProperties);
};

/**
 * Update optionPicker items
 * @param optionPicker the option picker
 * @param items the items of the option picker
 */
export const updateOptionPickerItems = (optionPicker: OptionPicker, items: IOptionPickerItem[]) => {
    const optionPickerProperties = optionPicker.getProperties();
    optionPicker.update({ ...optionPickerProperties, items });

};
