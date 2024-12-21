import {
    IOptionPickerColorItem,
    OptionPicker,
    OPTION_PICKER_TYPE_COLOR,
} from '@vfde-brix/ws10/option-picker';
import { StateProps } from 'app/container/Options/interface';
import { mountOptionPicker } from './OptionPicker';
import { OptionsActionDispatchers } from 'app/container/Options/slice';

/**
 * Mount the color picker
 */
const mountColorOptionPicker = (
    containerId: string,
    onChangeAction?: OptionsActionDispatchers['changeColor'],
): OptionPicker | null => {
    const items: IOptionPickerColorItem[] = [];
    const container = document.getElementById(containerId);

    const onChange = (event: Event) => {
        onChangeAction && onChangeAction((event.target as HTMLInputElement).value);
    };

    return container && mountOptionPicker(container, 'option-picker-color', OPTION_PICKER_TYPE_COLOR, 'option-picker-color', items, onChange);
};

/**
 * Convert colors from API to color option picker items
 */
export const convertColorsFromApiToColorOptionPickerItems = (
    { currentColor, availableColors = [] }: StateProps,
): IOptionPickerColorItem[] | undefined => {
    const items: IOptionPickerColorItem[] = [];

    for (const color of availableColors!) {
        let optChecked = false;

        if (currentColor?.displayLabel === color.displayLabel) {
            optChecked = true;
        }

        items.push({
            // We need to encode the value, because the API operates with HTML entities
            // (e. g. 'Gr&#252;n' instead of 'Grün'). It's decoded in the reducer.
            stdValue: encodeURIComponent(color.displayLabel),
            stdPrimaryLabel: color.displayLabel,
            stdColor: `rgb(${color.primaryColorRgb})`,
            optChecked,
        });
    }

    return items;
};

export default mountColorOptionPicker;
