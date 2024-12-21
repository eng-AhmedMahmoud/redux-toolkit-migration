import { NO_PATTERN_BUSINESS_LOGIC } from '@vfde-brix/ws10/core';
import {
    IPromotionalCardProperties,
    PromotionalCard,
    createPromotionalCard,
} from '@vfde-brix/ws10/promotional-card';

/**
 * mount Promotional Card By Id
 */
export const mountPromotionalCardById = (containerId: string, promotionalCardProps?: IPromotionalCardProperties): PromotionalCard | null => {
    const container = document.getElementById(containerId);

    /* istanbul ignore if */
    if (!container) {
        return null;
    }

    const promotionalCard = createPromotionalCard(container, promotionalCardProps ?? NO_PATTERN_BUSINESS_LOGIC);

    return promotionalCard;
};

/**
 * Updates the promotional Card
 */
export const updatePromotionalCard = (promotionalCard: PromotionalCard, promotionalCardProps: IPromotionalCardProperties) => {
    const oldPromotionalCardProps = promotionalCard.getProperties();
    promotionalCard.update({ ...oldPromotionalCardProps, ...promotionalCardProps });
};
