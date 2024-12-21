import { PromotionalCard } from '@vfde-brix/ws10/promotional-card';
import { ADDITIONAL_PAGE_OPTIONS } from '@vfde-sails/constants';
import { getTauschbonusAmount } from '@vfde-sails/page-options';
import { replacePlaceholders } from '@vfde-sails/utils';
import { updatePromotionalCard } from 'Component/PromotionalCard';

/**
 * update Tauschbonus promotional card properties stdLabel
 */
export const updateTauschbonus = (tauschbonusPromotionalCard: PromotionalCard, tauschbonusValue: number): void => {
    const stdLabel = replacePlaceholders(tauschbonusPromotionalCard?.getPropertyByKey('stdLabel'), { tauschbonusValue });
    updatePromotionalCard(tauschbonusPromotionalCard, { ...tauschbonusPromotionalCard.getProperties(), stdLabel });
};

/**
 * get Is Tauschbonus Eligible
 */
export const getIsTauschbonusEligible = (deviceId:string): boolean =>!!(window[ADDITIONAL_PAGE_OPTIONS]?.promos?.tauschbonus && getTauschbonusAmount(deviceId));
