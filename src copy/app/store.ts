import { configureStore } from '@reduxjs/toolkit';
import { listener } from './listener';
import { validationApi } from '@vfde-sails/validation';
import { tradeInApi } from '../api/tradeIn';
import { gladosApi } from '../api/glados';
import tariffSlice from '../features/Tariff/slice';
import optionsSlice from '../features/Options/slice';
import appSlice from '../features/App/slice';
import { commerceApi } from '@vfde-sails/vvl';
import tradeInSlice from '../features/TradeIn/slice';

const store = configureStore({
    reducer: {
        [gladosApi.reducerPath]: gladosApi.reducer,
        [tradeInApi.reducerPath]: tradeInApi.reducer,
        [validationApi.reducerPath]: validationApi.reducer,
        [tariffSlice.reducerPath]: tariffSlice.reducer,
        [optionsSlice.reducerPath]: optionsSlice.reducer,
        [appSlice.reducerPath]: appSlice.reducer,
        [commerceApi.reducerPath]: commerceApi.reducer,
        [tradeInSlice.reducerPath]: tradeInSlice.reducer,
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware(
            {
                serializableCheck: false,
            },
        )
            .prepend(listener.middleware) // listener goes first because of special actions in it
            .concat(
                gladosApi.middleware,
                tradeInApi.middleware,
                validationApi.middleware,
                commerceApi.middleware,
            ),
});

/**
 * Infer the `RootState` and `AppDispatch` types from the store itself
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * Infer AppDispatch
 */
export type AppDispatch = typeof store.dispatch;

/**
 * Hook-like function to dispatch actions
 */
export const useAppDispatch = () => store.dispatch;
