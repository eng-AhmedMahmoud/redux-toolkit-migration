import {
    IOptionPickerTextItem,
    OPTION_PICKER_TYPE_TEXT,
    OptionPicker,
} from '@vfde-brix/ws10/option-picker';
import { startAppListening } from '../../../app/listener';
import {
    RootState,
    useAppDispatch,
} from '../../../app/store';
import { mountOptionPicker } from '../../../components/OptionPicker';
import {
    selectCapacities,
    selectCapacitiesForColor,
    selectCurrentCapacity,
} from '../selectors';
import { changeCapacity } from '../slice';

/**
 * Mount the color picker
 */
export const mountCapacityOptionPicker = (containerId: string) => {
    const dispatch = useAppDispatch();

    const onChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        dispatch(changeCapacity(parseInt(target.value, 10)));
    };

    const items: IOptionPickerTextItem[] = [];

    const optionPicker = mountOptionPicker(
        containerId,
        {
            stdName: 'option-picker-capacity',
            optType: OPTION_PICKER_TYPE_TEXT,
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
            selectCapacities(currentState) !== selectCapacities(previousState)
            || selectCapacitiesForColor(currentState) !== selectCapacitiesForColor(previousState)
            || selectCurrentCapacity(currentState) !== selectCurrentCapacity(previousState)
        ,
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();

            updateCapacities(state, optionPicker);
        },
    });
};

const updateCapacities = (state: RootState, optionPicker: OptionPicker) => {
    const items = convertCapacitiesFromApiToCapacityOptionPickerItems(state);

    optionPicker.update({ items });
};

const convertCapacitiesFromApiToCapacityOptionPickerItems = (state: RootState): IOptionPickerTextItem[] => {
    const capacitiesForColor = selectCapacitiesForColor(state);
    const currentCapacity = selectCurrentCapacity(state);
    const availableCapacities = selectCapacities(state);
    const items: IOptionPickerTextItem[] = [];

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
