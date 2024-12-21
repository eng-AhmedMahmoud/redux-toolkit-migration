import {
    OptionPicker,
    createOptionPicker,
} from '@vfde-brix/ws10/option-picker';
import { useAppDispatch } from '../../../app/store';
import { setIsTradeInSelected } from '../slice';
import { ADDITIONAL_PAGE_OPTIONS } from '@vfde-sails/constants';

const { attributeValues } = window[ADDITIONAL_PAGE_OPTIONS].vlux;
// We're interested in the keys not the values
const attributeKeys = Object.keys(attributeValues);

/**
 * Mount the tradein option picker
 */
export const mountTradeInOptionPicker = (containerId: string, isTradeIn: boolean): OptionPicker | null => {
    const container = document.getElementById(containerId);

    /* istanbul ignore if */
    if (!container) {
        return null;
    }

    const dispatch = useAppDispatch();

    const onChange = (event: Event) => {
        const value = (event.target as HTMLInputElement).value;

        dispatch(setIsTradeInSelected(value === attributeKeys[0]));
    };

    const optionPicker = createOptionPicker(container, { onChange });

    // Revert back to the initial state after page reload
    // to reset the 'checked' state of the picker if trade-in is not active
    // Because browsers try to remember the last 'checked' state of radio buttons
    optionPicker.setValue(isTradeIn ? attributeKeys[0] : attributeKeys[1]);

    optionPicker?.toggleContainer(false, true);

    return optionPicker;
};
