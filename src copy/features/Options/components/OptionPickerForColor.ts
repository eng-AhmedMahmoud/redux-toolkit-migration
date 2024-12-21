import {
    IOptionPickerColorItem,
    OPTION_PICKER_TYPE_COLOR,
    OptionPicker,
} from '@vfde-brix/ws10/option-picker';
import { startAppListening } from '../../../app/listener';
import {
    RootState,
    useAppDispatch,
} from '../../../app/store';
import { mountOptionPicker } from '../../../components/OptionPicker';
import {
    selectColorOptions,
    selectCurrentColor,
} from '../selectors';
import { changeColor } from '../slice';

/**
 * Mount the color picker
 */
export const mountColorOptionPicker = (containerId: string): OptionPicker | null => {
    const dispatch = useAppDispatch();

    const onChange = (event: Event) => {
        dispatch(changeColor((event.target as HTMLInputElement).value));
    };

    const items: IOptionPickerColorItem[] = [];

    const optionPicker = mountOptionPicker(
        containerId,
        {
            stdName: 'option-picker-color',
            optType: OPTION_PICKER_TYPE_COLOR,
            items,
            business: {
                onChange,
            },
        },
    );

    /* istanbul ignore if */
    if (!optionPicker) {
        return null;
    }

    listenForUpdates(optionPicker);

    return optionPicker;
};

const listenForUpdates = (optionPicker: OptionPicker) => {
    startAppListening({
        predicate: (_action, currentState, previousState) =>
            selectColorOptions(currentState) !== selectColorOptions(previousState)
        ,
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();

            updateColors(state, optionPicker);
        },
    });
};

const updateColors = (state: RootState, optionPicker: OptionPicker) => {
    const items = convertColorsFromApiToColorOptionPickerItems(state);

    optionPicker.update({ items });
};

const convertColorsFromApiToColorOptionPickerItems = (state: RootState): IOptionPickerColorItem[] | undefined => {
    const colorOptions = selectColorOptions(state);
    const currentColor = selectCurrentColor(state);
    const items: IOptionPickerColorItem[] = [];

    for (const color of colorOptions!) {
        let optChecked = false;

        if (currentColor?.displayLabel === color.displayLabel) {
            optChecked = true;
        }

        items.push({
            stdValue: encodeURIComponent(color.displayLabel),
            stdPrimaryLabel: color.displayLabel,
            stdColor: `rgb(${color.primaryColorRgb})`,
            optChecked,
        });
    }

    return items;
};
