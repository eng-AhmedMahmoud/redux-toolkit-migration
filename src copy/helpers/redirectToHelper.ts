import { ADDITIONAL_PAGE_OPTIONS } from '@vfde-sails/constants';

/**
 * Redirect to page
 */
export function redirectToPage (pageUrl: string) {
    window.location.assign(pageUrl);
}

/**
 * Redirect to DOP
 */
export function redirectToDop () {
    const { dopPageUrl } = window[ADDITIONAL_PAGE_OPTIONS];
    redirectToPage(dopPageUrl);
}

/**
 * Delete storage
 */
export const deleteStorage = (storageKey: string): void => {
    sessionStorage.removeItem(storageKey);
};
