import {
    SerializedError,
    configureStore,
} from '@reduxjs/toolkit';
import { requestJson } from '@vfde-sails/utils';
import {
    getTradeInDevices,
    tradeInApi,
} from '../tradeIn';
import {
    TRADEIN_INPUT_MAX_LENGTH,
    TRADEIN_INPUT_MIN_LENGTH,
} from '../../features/TradeIn/constants';
import {
    ApiDevice,
    ApiResponse,
} from '../../features/TradeIn/interfaces/api';
import { filterAndFormatDevices } from '../../features/TradeIn/helpers/filterAndFormatDevices';

jest.mock('@vfde-sails/utils', () => ({
    ...jest.requireActual('@vfde-sails/utils'),
    requestJson: jest.fn(),
}));

const createStoreForTest = () => configureStore({
    reducer: {
        [tradeInApi.reducerPath]: tradeInApi.reducer,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(tradeInApi.middleware),
});

describe('TradeIn API', () => {
    let store: ReturnType<typeof createStoreForTest>;

    beforeEach(() => {
        store = createStoreForTest();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getTradeInDevices', () => {
        it('returns null when input value is too short', async () => {
            const inputValue = 'a'.repeat(TRADEIN_INPUT_MIN_LENGTH - 1);
            const resultAction = await store.dispatch(getTradeInDevices.initiate(inputValue));

            expect(resultAction.data).toBeNull();
        });

        it('returns empty array when input value is too long', async () => {
            const inputValue = 'a'.repeat(TRADEIN_INPUT_MAX_LENGTH + 1);
            const resultAction = await store.dispatch(getTradeInDevices.initiate(inputValue));

            expect(resultAction.data).toEqual([]);
        });

        it('returns filtered and formatted devices (success case)', async () => {
            const response: ApiResponse<ApiDevice[]> = {
                status: 200,
                statusText: 'success',
                body: [
                    {
                        name: 'foo1',
                        id: '1',
                        productOfferingPrice: [
                            {
                                price: {
                                    value: 1,
                                },
                            },
                        ],
                        attachment: [
                            {
                                url: 'foo',
                            },
                        ],
                    } as ApiDevice,
                    {
                        name: 'foo2',
                        id: '2',
                        productOfferingPrice: [
                            {
                                price: {
                                    value: 1,
                                },
                            },
                        ],
                        attachment: [
                            {
                                url: 'foo',
                            },
                        ],
                    } as ApiDevice,
                    {
                        name: 'foo3',
                        id: '3',
                        productOfferingPrice: [
                            {
                                price: {
                                    value: 1,
                                },
                            },
                        ],
                        attachment: [
                            {
                                url: 'foo',
                            },
                        ],
                    } as ApiDevice,
                ],
            };

            (requestJson as jest.Mock).mockReturnValueOnce(Promise.resolve(response));

            const inputValue = 'a'.repeat(TRADEIN_INPUT_MIN_LENGTH + 1);
            const resultAction = await store.dispatch(getTradeInDevices.initiate(inputValue));

            const expectedDevices = filterAndFormatDevices(response.body);

            expect(resultAction.data).toEqual(expectedDevices);
        });

        it('rejects when response is falsy', async () => {
            (requestJson as jest.Mock).mockRejectedValue({
                message: 'Unexpected response',
                body: null,
            });

            const inputValue = 'a'.repeat(TRADEIN_INPUT_MIN_LENGTH + 1);
            const resultAction = await store.dispatch(getTradeInDevices.initiate(inputValue));

            expect((resultAction.error as SerializedError).message).toBe('Unexpected response');
        });

        it('rejects when something unexpected happens', async () => {
            (requestJson as jest.Mock).mockImplementationOnce(() => {
                throw new Error('foo');
            });

            const inputValue = 'a'.repeat(TRADEIN_INPUT_MIN_LENGTH + 1);
            const resultAction = await store.dispatch(getTradeInDevices.initiate(inputValue));

            expect((resultAction.error as SerializedError).message).toBe('foo');
        });
    });
});
