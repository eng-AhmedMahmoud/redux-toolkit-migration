## Redux Toolkit Migration

-new api selectors
/\*\*

-   Selects the HardwareDetailGroup query selector
    \*/
    const createHardwareDetailGroupSelector = createAppSelector(
    [
    state => state.vvlDeviceDetailsApp.salesChannel,
    ],
    salesChannel => getHardwareDetailGroup.select({
    salesChannel: salesChannel!,
    }),
    );

/\*\*

-   Selects the HardwareDetailGroup query
    \*/
    const selectHardwareDetailGroupQuery = createAppSelector(
    [
    state => state,
    createHardwareDetailGroupSelector,
    ],
    (state, selector) => selector(state),
    );

/\*\*

-   Selects the full device
    \*/
    const selectDevice = createAppSelector(
    [
    selectHardwareDetailGroupQuery,
    ],
    query => query?.data || null,
    );

-example usage
/\*\*

-   Selects error state directly from the state
    \*/
    const selectOptionsLoadingFlag = createAppSelector(
    [
    selectHardwareDetailGroupQuery,
    ],
    state => state.isLoading,
    );

/\*\*

-   Selects error state directly from the state
    \*/
    const selectOptionsErrorsFlag = createAppSelector(
    [
    selectHardwareDetailGroupQuery,
    ],
    state => state.isError,
    );

/\*\*

-   Selects the device name
    \*/
    const selectDeviceName = createAppSelector(
    [selectDevice],
    (device: HardwareDetailGroupResponse | null): string | null => device?.data.modelName || null,
    );

-new isolated api
export const gladosApi = createApi({
reducerPath: 'Glados',
baseQuery: fakeBaseQuery(),
endpoints: build => ({
getHardwareDetailGroup: build.query< HardwareDetailGroupResponse, GetHardwareDetailGroupQueryArgs>({
queryFn: async (arg, api) => {
const { salesChannel } = arg;
const hardwareService = GladosServiceFactory.getHardwareService();

                /* dev-only-code:start */
                hardwareService.setMocking(!!getQueryParam('useMockedApi'));
                /* dev-only-code:end */
                const state = api.getState() as RootState;

                const deviceId = selectDeviceId(state);

                const subscriptionIds = getSubscriptionIdsFromCms(salesChannel);

                const params: HardwareDetailGroupParams = {
                    btx: API_BTX_VVL,
                    salesChannel: [MAP_SALESCHANNEL_TO_API_SALESCHANNEL[salesChannel]],
                    groupId: deviceId!,
                    discountIds: [],
                    tariffIds: subscriptionIds,
                };

                try {
                    const response = await hardwareService.getHardwareDetailGroup('v1', params);

                    return { data: response.data };
                }
                catch (error) {

                    return {
                        error: miniSerializeError(error),
                    };
                }
            },
        }),
        getTariffWithHardware: build.query<TariffWithHardwareResponse, GetTariffWithHardwareQueryArgs>({
            queryFn: async (arg, api) => {
                const { salesChannel, isTradeIn } = arg;
                const tariffService = GladosServiceFactory.getTariffService();

                /* dev-only-code:start */
                tariffService.setMocking(!!getQueryParam('useMockedApi'));
                /* dev-only-code:end */
                const state = api.getState() as RootState;
                const deviceId = selectDeviceId(state);
                const atomicDevices = selectAtomicDevices(state);
                const subscriptionIds = getSubscriptionIdsFromCms(salesChannel);
                const isGigakombiEligible = selectIsGigakombiEligible(state);
                const gigakombiType = selectGigakombiType(state);
                const isTauschbonus = selectIsTauschbonus(state);
                const allDiscountsOptions: GetAllDiscountsOptions = {
                    salesChannel,
                    deviceId,
                    subscriptionIds,
                    isGigakombi: isGigakombiEligible && !!gigakombiType,
                    gigakombiType: gigakombiType || undefined,
                    isTradeIn,
                    isTauschbonus,
                    isRestlaufzeit: false,
                };
                const discountsIds = getAllDiscounts(allDiscountsOptions);
                const params: TariffWithHardwareParams = {
                    btx: API_BTX_VVL,
                    salesChannel: [MAP_SALESCHANNEL_TO_API_SALESCHANNEL[salesChannel as SalesChannel]],
                    // @TODO check that the fist call when trade in device selected the discounts get reflected in the offerSummaryCard,
                    discountIds: isTradeIn && isTauschbonus ? [...discountsIds, '10439'] : discountsIds,
                    tariffIds: subscriptionIds,
                    atomicIds: atomicDevices.map(atomic => atomic.hardwareId),
                };

                try {
                    const response = await tariffService.getTariffWithHardware('v1', params);

                    return { data: response.data };
                }
                catch (error) {
                    return {
                        error: miniSerializeError(error),
                    };
                }
            },
        }),
    }),

});

export const {
getHardwareDetailGroup,
getTariffWithHardware,
} = gladosApi.endpoints;

-old shattered api
/\*\*

-   Get device from Glados
    _/
    export function_ getDeviceSaga (): Generator<StrictEffect> {
    const hardwareService = GladosServiceFactory.getHardwareService();

        /* dev-only-code:start */
        hardwareService.setMocking(!!getQueryParam('useMockedApi'));
        /* dev-only-code:end */

        const [
            salesChannel,
            deviceId,
        ] = (yield all([
            select(selectSalesChannel()),
            select(selectDeviceId()),
        ])) as [
            NonNullable<SelectorReturnType<typeof selectSalesChannel>>,
            NonNullable<SelectorReturnType<typeof selectDeviceId>>,
        ];

        const subscriptionIds = getSubscriptionIdsFromCms(salesChannel);

        const params: HardwareDetailGroupParams = {
            btx: API_BTX_VVL,
            salesChannel: [MAP_SALESCHANNEL_TO_API_SALESCHANNEL[salesChannel as SalesChannel]],
            groupId: deviceId!,
            discountIds: [],
            tariffIds: subscriptionIds,
        };

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

// and for the tariff api

/\*\*

-   Get subscription from Glados
    _/
    export function_ getSubscriptionsSaga (): Generator<StrictEffect> {
    const tariffService = GladosServiceFactory.getTariffService();

        /* dev-only-code:start */
        tariffService.setMocking(!!getQueryParam('useMockedApi'));
        /* dev-only-code:end */

        const [
            deviceId,
            salesChannel,
            atomicDevices,
            gigakombiType,
            isGigakombiEligible,
            subscriptionId,
            isTradeIn,
            isTauschbonus,
        ] = (yield all([
            select(selectDeviceId()),
            select(selectSalesChannel()),
            select(selectAtomicDevices()),
            select(selectGigakombiType()),
            select(selectIsGigakombiEligible()),
            select(selectSubscriptionId()),
            select(selectIsTradeIn()),
            select(selectIsTauschbonus()),
        ])) as [
                NonNullable<SelectorReturnType<typeof selectDeviceId>>,
                NonNullable<SelectorReturnType<typeof selectSalesChannel>>,
                NonNullable<SelectorReturnType<typeof selectAtomicDevices>>,
                NonNullable<SelectorReturnType<typeof selectGigakombiType>>,
                NonNullable<SelectorReturnType<typeof selectIsGigakombiEligible>>,
                NonNullable<SelectorReturnType<typeof selectSubscriptionId>>,
                NonNullable<SelectorReturnType<typeof selectIsTradeIn>>,
                NonNullable<SelectorReturnType<typeof selectIsTauschbonus>>,
            ];

        const subscriptionIds = (yield call(getSubscriptionIdsFromCms, salesChannel as SalesChannel)) as ReturnType<typeof getSubscriptionIdsFromCms>;

        const allDiscountsOptions: GetAllDiscountsOptions = {
            salesChannel,
            deviceId,
            subscriptionIds,
            isGigakombi: isGigakombiEligible && !!gigakombiType,
            gigakombiType,
            isTradeIn,
            isTauschbonus,
            isRestlaufzeit: false,
        };

        // @todo check the discount logic especially with GigaKombi (Logic was at getRequestBody func)
        const params: TariffWithHardwareParams = {
            btx: API_BTX_VVL,
            salesChannel: [MAP_SALESCHANNEL_TO_API_SALESCHANNEL[salesChannel as SalesChannel]],
            discountIds: getAllDiscounts(allDiscountsOptions),
            tariffIds: subscriptionIds,
            atomicIds: atomicDevices?.map(atomic => atomic.hardwareId) || [],
        };

        try {
            const response =
                (yield call([tariffService, tariffService.getTariffWithHardware], 'v1', params)) as
                    Awaited<ReturnType<typeof tariffService.getTariffWithHardware<RedTariff | YoungTariff>>>;
            const { data } = response;

            yield put(getSubscriptionsSuccess(data));
            yield call(createTrackingData);

            const offers = (yield select(selectActiveOffers())) as
                NonNullable<SelectorReturnType<typeof selectActiveOffers>>;

            if (!checkSubscriptionIdExistsInSubscriptions(subscriptionId, offers)) {

                yield put(setSubscriptionId(offers[offers.length - 1].virtualItemId as RedTariff | YoungTariff));
            }
        }
        catch (error) {
            // eslint-disable-next-line no-console
            yield call([console, 'error'], error);

            if (error instanceof Error) {
                yield put(getSubscriptionsFailed());
            }
        }

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
