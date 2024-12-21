import { createListenerMiddleware } from '@reduxjs/toolkit';
import type {
    AppDispatch,
    RootState,
} from './store';

export const listener = createListenerMiddleware();

/**
 * Function to start listening for actions
 */
export const startAppListening = listener.startListening.withTypes<
    RootState,
    AppDispatch
>();
