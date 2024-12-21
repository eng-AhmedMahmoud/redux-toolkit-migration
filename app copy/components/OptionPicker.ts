import {
    createOptionPicker,
    OptionPicker,
    OptionPickerType,
    IOptionPickerItem,
} from '@vfde-brix/ws10/option-picker';

/**
 * Mount Option Picker
 */
export const mountOptionPicker = (container: HTMLElement, stdName: string, optType: OptionPickerType, optionPickerTitle: string, items: IOptionPickerItem[], onChange: (Event: Event) => void): OptionPicker => container && createOptionPicker(container, {
    optType,
    stdName,
    stdScreenreaderLegend: optionPickerTitle,
    items,
    business: {
        onChange,
    },
});
