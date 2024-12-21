import {
    SAILS_VVL_STORAGE,
    SAILS_PARAM_ATOMIC_ID,
} from '@vfde-sails/constants';
import {
    getSessionStorageItemJson,
    SailsVvlStorage,
} from '@vfde-sails/storage';

/**
 * Get Atomic Id
 */
export const getAtomicId = (): string | null => getAtomicFromStorage() || null;

/**
 * Get Atomic From Storage
 */
const getAtomicFromStorage = (): string | null => {
    const storage = getSessionStorageItemJson<SailsVvlStorage>(SAILS_VVL_STORAGE);

    const atomicId = storage?.[SAILS_PARAM_ATOMIC_ID];

    if (typeof atomicId === 'boolean' || !atomicId) {
        return null;
    }

    return `${atomicId}`;
};
