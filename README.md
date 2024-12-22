## Redux Toolkit Migration

saga

/**
 * Get device from Glados
 */
export function* getDeviceSaga (): Generator<StrictEffect> {
    const hardwareService = GladosServiceFactory.getHardwareService();

    // Collecting data to make the api request

    try {
        const response =
        (yield call([hardwareService, hardwareService.getHardwareDetailGroup], 'v1', params)) as
            Awaited<ReturnType<typeof hardwareService.getHardwareDetailGroup>>;
        const { data } = response;

        yield put(getDeviceSuccess(data));
    }
    catch (error: any) {
        // eslint-disable-next-line no-console
        yield call([console, 'error'], error);

        const { response } = error;

        if (response && response.status === 404) {
            yield call(redirectToDop);
        }
        else {
            yield put(getDeviceFailed());
        }
    }
}

/**
 * Get device success saga
 */
export function* getDeviceSuccessSaga (): Generator<StrictEffect> {
    const atomicId = (yield select(selectAtomicId())) as SelectorReturnType<typeof selectAtomicId>;
    yield put(setAtomicId(atomicId!));
    yield put(getSubscriptions());
}

listeners

/**
_ Adds the listener for the `setDefaultState` case.
_ It then initiates the `getHardwareDetailGroup` request.
\*/
setDefaultState: () => startAppListening({
actionCreator: setDefaultState,
effect: (\_action, listenerApi) => {
const state = listenerApi.getState();
const deviceId = selectDeviceId(state);
const salesChannel = selectSalesChannel(state) as SalesChannel;
deviceId ? listenerApi.dispatch(getHardwareDetailGroup.initiate({ salesChannel })) : redirectToDop();
},
}),
/**
_ Adds the listener for the `getHardwareDetailGroup.matchFulfilled` case.
_ It then checks if the user has selected a tariff ID and initiates the `getTariffWithHardware` request.
\*/
getDeviceFulfilled: () => startAppListening({
matcher: getHardwareDetailGroup.matchFulfilled,
effect: (\_action, listenerApi) => {
const state = listenerApi.getState();

            const atomicId = selectAtomicId(state);
            listenerApi.dispatch(setAtomicId({ atomicId }));

            const salesChannel = selectSalesChannel(state) as SalesChannel;
            const isTradeIn = selectIsTradeIn(state);

            const devicePayload = _action.payload;
            listenerApi.dispatch(setDevicePayload(devicePayload));

            listenerApi.dispatch(getTariffWithHardware.initiate({ salesChannel, isTradeIn }));
        },
    }),
    /**
     * Adds the listener for the `getHardwareDetailGroup.matchRejected` case.
     * It handles the error cases, including 404 redirects and general error handling.
     */
    getDeviceRejected: () => startAppListening({
        matcher: getHardwareDetailGroup.matchRejected,
        effect: action => {
            // eslint-disable-next-line no-console
            console.error(action.error);

            const { code } = action.error;

            if (code === '404') {
                redirectToDop();
            }
        },
    }),

components

standalone 
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
import { selectColorOptions } from '../selectors';
import { changeColor } from '../slice';
import { convertColorsFromApiToColorOptionPickerItems } from '../helpers/convertColorHelper';

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
            stdScreenreaderLegend: 'option-picker-color',
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

shared component
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

component helper
import { RootState } from '../../../app/store';
import {
    selectColorOptions,
    selectCurrentColor,
} from '../selectors';
import { IOptionPickerColorItem } from '@vfde-brix/ws10/option-picker';

/**
 *
 */
export const convertColorsFromApiToColorOptionPickerItems = (state: RootState): IOptionPickerColorItem[] => {
    const colorOptions = selectColorOptions(state);
    const currentColor = selectCurrentColor(state);
    const items: IOptionPickerColorItem[] = [];

    if (!colorOptions) {
        return items;
    }

    for (const color of colorOptions) {
        items.push({
            stdValue: encodeURIComponent(color.displayLabel),
            stdPrimaryLabel: color.displayLabel,
            stdColor: `rgb(${color.primaryColorRgb})`,
            optChecked: currentColor?.displayLabel === color.displayLabel,
        });
    }

    return items;
};
