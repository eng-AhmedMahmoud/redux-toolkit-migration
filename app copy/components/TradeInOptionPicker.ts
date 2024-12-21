import {
    OptionPicker,
    createOptionPicker,
} from '@vfde-brix/ws10/option-picker';
import { ADDITIONAL_PAGE_OPTIONS } from '@vfde-sails/constants';
import type { TradeInActionDispatchers } from 'app/container/TradeIn/slice';

const { attributeValues } = window[ADDITIONAL_PAGE_OPTIONS].vlux;
// We're interested in the keys not the values
const attributeKeys = Object.keys(attributeValues);

/**
 * Mount trade-in option picker
 */
const mountTradeInOptionPicker = (
    containerId: string,
    changeAction: TradeInActionDispatchers['setIsTradeInSelected'],
    isTradeIn: boolean,
): OptionPicker | null => {
    const container = document.getElementById(containerId);

    if (!container) {
        return null;
    }

    const onChange = (event: Event) => {
        const value = (event.target as HTMLInputElement).value;
        changeAction(value === attributeKeys[0]);
    };

    const optionPicker = createOptionPicker(container, { onChange });

    // Revert back to the initial state after page reload
    // to reset the 'checked' state of the picker if trade-in is not active
    // Because browsers try to remember the last 'checked' state of radio buttons
    optionPicker.setValue(isTradeIn ? attributeKeys[0] : attributeKeys[1]);

    return optionPicker;
};

export default mountTradeInOptionPicker;
