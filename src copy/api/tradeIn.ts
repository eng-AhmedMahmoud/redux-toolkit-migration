import { miniSerializeError } from '@reduxjs/toolkit';
import {
    createApi,
    fakeBaseQuery,
} from '@reduxjs/toolkit/query';
import {
    getApiConfig,
    getQueryParam,
    requestJson,
    sanitizeInput,
} from '@vfde-sails/utils';
import {
    API_CREDENTIALS,
    TRADE_IN_API_QUERY_PARAM,
    TRADEIN_INPUT_MAX_LENGTH,
    TRADEIN_INPUT_MIN_LENGTH,
} from '../features/TradeIn/constants';
import { filterAndFormatDevices } from '../features/TradeIn/helpers/filterAndFormatDevices';
import {
    ApiDevice,
    ApiResponse,
    Device,
} from '../features/TradeIn/interfaces/api';

export const tradeInApi = createApi({
    reducerPath: 'TradeInApi',
    baseQuery: fakeBaseQuery(),
    endpoints: build => ({
        getTradeInDevices: build.query<Device[] | null, string>({
            queryFn: async inputValue => {
                if (inputValue.length < TRADEIN_INPUT_MIN_LENGTH) {
                    // search input is too short, treat it as default case where data is null
                    return { data: null };
                }

                if (inputValue.length > TRADEIN_INPUT_MAX_LENGTH) {
                    // search input is too long, treat it as device not found
                    return { data: [] };
                }

                const { key, url } = getApiConfig(
                    API_CREDENTIALS,
                    /* dev-only-code:start */ !!getQueryParam('useMockedTradeInApi') ||
                        !!getQueryParam('useMockedApi'), /* dev-only-code:end */
                );
                const sanitizedInputValue = sanitizeInput(inputValue);

                const requestUrl = `${url}?${TRADE_IN_API_QUERY_PARAM}=${encodeURIComponent(sanitizedInputValue)}`;
                const options = {
                    method: 'GET',
                    headers: {
                        // @TODO: Naming convention doesnt support auth https://github.com/xojs/eslint-config-xo-typescript/issues/44
                        Authorization: `Basic ${key}`, // eslint-disable-line @typescript-eslint/naming-convention
                        'Content-Type': 'application/json',
                        'vf-country-code': 'DE',
                        'vf-project': 'DLS',
                    },
                };

                try {
                    const response = await requestJson( requestUrl,
                        options) as ApiResponse<ApiDevice[]>;
                    const { body: apiDevices } = response;
                    const devices = filterAndFormatDevices(apiDevices);

                    return { data: devices };
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
    getTradeInDevices,
} = tradeInApi.endpoints;
