import { getTauschbonusAmount } from '@vfde-sails/page-options';
import replaceCMSPlaceholder from './replaceCMSPlaceholder';
import { PromotionalCardProps } from '../features/Tariff/interfaces/interface';

/**
 * Get tradeIn promotion card properties
 *  @param isTauschbonus isTauschbonus
 *  @param deviceId device Id
 */
export const getTradeInPromotionCardProperties = (
    isTauschbonus: boolean,
    deviceId: string,
): PromotionalCardProps => {
    const { promotionalCard } = (window as any).additionalPageOptions;
    const tradeInPromotionalCard = promotionalCard.tradeInPromotionalCard;

    if (isTauschbonus) {
        const tauschbonusAmount = getTauschbonusAmount(deviceId);

        return {
            ...tradeInPromotionalCard,
            txtSublabel: replaceCMSPlaceholder(
                tradeInPromotionalCard.txtSublabelTauschbonus,
                { tauschbonusAmount: `${tauschbonusAmount}` },
            ),
        };
    }

    return tradeInPromotionalCard;
};
