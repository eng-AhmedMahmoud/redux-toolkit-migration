import { PromotionalCard } from '@vfde-brix/ws10/promotional-card';
import {
    ADDITIONAL_PAGE_OPTIONS,
    SAILS_PARAM_TAUSCHBONUS,
    SAILS_VVL_STORAGE,
} from '@vfde-sails/constants';
import { getTauschbonusAmount } from '@vfde-sails/page-options';
import {
    getSessionStorageItemJson,
    SailsVvlStorage,
} from '@vfde-sails/storage';
import { replacePlaceholders } from '@vfde-sails/utils';
import { updatePromotionalCard } from '../components/PromotionalCard';

/**
 * Get isTradeIn from storage
 */
export const getIsTauschbonus = (): boolean => {
    const storage = getSessionStorageItemJson<SailsVvlStorage>(SAILS_VVL_STORAGE);
    const isTauschbonus = storage?.[SAILS_PARAM_TAUSCHBONUS] ?? false;

    return isTauschbonus;
};

/**
 * get Is Tauschbonus Eligible
 */
export const getIsTauschbonusEligible = (deviceId:string): boolean =>!!(window[ADDITIONAL_PAGE_OPTIONS]?.promos?.tauschbonus && getTauschbonusAmount(deviceId));

/**
 * update Tauschbonus promotional card properties stdLabel
 */
export const updateTauschbonus = (tauschbonusPromotionalCard: PromotionalCard, tauschbonusValue: number): void => {
    const stdLabel = replacePlaceholders(tauschbonusPromotionalCard?.getPropertyByKey('stdLabel'), { tauschbonusValue });
    updatePromotionalCard(tauschbonusPromotionalCard, { ...tauschbonusPromotionalCard.getProperties(), stdLabel });
};
