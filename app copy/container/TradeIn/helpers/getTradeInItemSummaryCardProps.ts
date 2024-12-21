import { NO_PATTERN_BUSINESS_LOGIC } from '@vfde-brix/ws10/core';
import { IItemSummaryCardItemProperties } from '@vfde-brix/ws10/item-summary-card';
import { ADDITIONAL_PAGE_OPTIONS } from '@vfde-sails/constants';
import { getTauschbonusAmount } from '@vfde-sails/page-options';
import { replacePlaceholders } from '@vfde-sails/utils';
import { StateProps } from '../../.././container/TradeIn/interfaces/state';

const getTradeInItemSummaryCardProps = (state: StateProps): IItemSummaryCardItemProperties[] => {

    const { tradeIn: tradeInOptions, tauschbonus: tauschbonusOptions } = window[ADDITIONAL_PAGE_OPTIONS].promos;
    const tauschbonusValue = getTauschbonusAmount(state.deviceId!);

    const newProps: IItemSummaryCardItemProperties = {
        containerCopytext: '',
        optIconButton: true,
        image: {},
        stdHeadline: '',
        stdSubline: '',
        business: NO_PATTERN_BUSINESS_LOGIC,
    };

    if (state.isTauschbonus) {
        newProps.containerCopytext = tauschbonusOptions && replacePlaceholders(tauschbonusOptions.tauschbonusSubline, { tauschbonusValue: `${tauschbonusValue}` });
    }

    const imgSrc = state.selectedTradeInDevice?.imgSrc;
    newProps.image = {
        imgSrcDesktop: imgSrc,
        imgSrcMobile: imgSrc,
        stdImgAlt: '',
    };
    newProps.stdHeadline = state.selectedTradeInDevice?.name || '';

    if (tradeInOptions?.itemSummaryCardSubline) {
        newProps.stdSubline = replacePlaceholders(
            tradeInOptions.itemSummaryCardSubline,
            { maxPrice: state.selectedTradeInDevice?.formattedPrice || '' },
        );
    }

    return [newProps];
};

export default getTradeInItemSummaryCardProps;
