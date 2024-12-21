import {
    createLoadingSpinner,
    LoadingSpinner,
    LOADING_SPINNER_SIZE_MEDIUM,
} from '@vfde-brix/ws10/loading-spinner';

/**
 * Mount loading spinner
 */
export const mountLoadingSpinner = (containerId: string): LoadingSpinner => {
    const container = document.getElementById(containerId) as HTMLElement;

    return container && createLoadingSpinner(container, {
        optSize: LOADING_SPINNER_SIZE_MEDIUM,
        business: {},
    });
};
