import {
    IOptionPickerTextItem,
    OPTION_PICKER_TYPE_TEXT,
} from '@vfde-brix/ws10/option-picker';
import { StateProps } from 'app/container/Options/interface';
import { mountOptionPicker } from './OptionPicker';
import { OptionsActionDispatchers } from 'app/container/Options/slice';

/**
 * Mount the color picker
 */
const mountCapacityOptionPicker = (
    containerId: string,
    onChangeAction?: OptionsActionDispatchers['changeCapacity'],
) => {
    const items: IOptionPickerTextItem[] = [];
    const container = document.getElementById(containerId);

    const onChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        onChangeAction && onChangeAction(parseInt(target.value, 10));
    };

    return container && mountOptionPicker(container, 'option-picker-capacity', OPTION_PICKER_TYPE_TEXT, 'option-picker-capacity', items, onChange);
};

/**
 * Convert colors from API to color option picker items
 */
export const convertCapacitiesFromApiToCapacityOptionPickerItems = (
    { currentCapacity, availableCapacities, capacitiesForColor }: StateProps,
): IOptionPickerTextItem[] | undefined => {
    const items: IOptionPickerTextItem[] = [];

    if (!availableCapacities || !capacitiesForColor) {
        // availableCapacities & capacitiesForColor could be null
        return items;
    }

    const availableSizes = capacitiesForColor!.map(capacity => capacity.sortValue);

    for (const capacity of availableCapacities!) {
        const optChecked = currentCapacity?.sortValue === capacity.sortValue;
        const optDisabled = !availableSizes.includes(capacity.sortValue);

        items.push({
            stdValue: `${capacity.sortValue}`,
            stdPrimaryLabel: capacity.displayLabel,
            optChecked,
            optDisabled,
        });
    }

    return items;
};

export default mountCapacityOptionPicker;
