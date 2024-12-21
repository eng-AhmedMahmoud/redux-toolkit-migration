import {
    ADDITIONAL_PAGE_OPTIONS,
    NSF_STORAGE_CURIOSITY_FLOW,
    SAILS_VVL_STORAGE,
} from '@vfde-sails/constants';
import {
    call,
    StrictEffect,
} from 'redux-saga/effects';

/**
 * Redirect to page
 */
export function* redirectToPage (pageUrl: string) {
    yield call([window.location, 'assign'], pageUrl);
}

/**
 * Redirect to mTan page
 */
export function* redirectToMtanPage () {
    const { mTanPageUrl } = window[ADDITIONAL_PAGE_OPTIONS];

    // Delete sails VVL and curiosity storage
    yield call(deleteStorage, SAILS_VVL_STORAGE);
    yield call(deleteStorage, NSF_STORAGE_CURIOSITY_FLOW);

    // Redirect to mTan page
    yield call(redirectToPage, mTanPageUrl);
}

/**
 * Redirect to DOP
 */
export function* redirectToDop (): Generator<StrictEffect> {
    const { dopPageUrl } = window[ADDITIONAL_PAGE_OPTIONS];
    yield call(redirectToPage, dopPageUrl);
}

/**
 * Delete storage
 */
export const deleteStorage = (storageKey: string): void => {
    sessionStorage.removeItem(storageKey);
};
