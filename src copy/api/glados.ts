import { miniSerializeError } from '@reduxjs/toolkit';
import {
    createApi,
    fakeBaseQuery,
} from '@reduxjs/toolkit/query';
import {
    GladosServiceFactory,
    HardwareDetailGroupParams,
    HardwareDetailGroupResponse,
    TariffWithHardwareParams,
    TariffWithHardwareResponse,
} from '@vfde-sails/glados-v2';
import { getQueryParam } from '@vfde-sails/utils';
import {
    API_BTX_VVL,
    MAP_SALESCHANNEL_TO_API_SALESCHANNEL,
    SalesChannel,
} from '@vfde-sails/constants';
import {
    getAllDiscounts,
    GetAllDiscountsOptions,
} from '@vfde-sails/page-options';
import { RootState } from '../app/store';
import {
    selectDeviceId,
    selectGigakombiType,
    selectIsGigakombiEligible,
    selectIsTauschbonus,
} from '../features/App/selectors';
import { selectAtomicDevices } from '../features/Options/selectors';
import { getSubscriptionIdsFromCms } from '../helpers/tariffOptionPickerHelpers';
import {
    GetHardwareDetailGroupQueryArgs,
    GetTariffWithHardwareQueryArgs,
} from './interface';

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
