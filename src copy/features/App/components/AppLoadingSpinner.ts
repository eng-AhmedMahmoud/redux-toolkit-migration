import { LoadingSpinner } from '@vfde-brix/ws10/loading-spinner';
import { startAppListening } from '../../../app/listener';
import { selectIsLoading } from '../selectors';
import { mountLoadingSpinner } from '../../../components/LoadingSpinner';

/**
 * Mount app loading spinner
 * @param containerId the container id
 * @returns Loading Spinner component
 */
export const mountAppLoadingSpinner = (containerId: string): LoadingSpinner | null => {

    const loadingSpinner = mountLoadingSpinner(containerId);

    listenForUpdates(loadingSpinner);

    return loadingSpinner;
};

const listenForUpdates = (loadingSpinner: LoadingSpinner) => {
    startAppListening({
        predicate: (_action, currentState, prevState) => selectIsLoading(currentState) !== selectIsLoading(prevState),
        effect: (_action, listenerApi) => {
            const isLoading = selectIsLoading(listenerApi.getState());
            loadingSpinner?.toggle(isLoading);
        },
    });
};
