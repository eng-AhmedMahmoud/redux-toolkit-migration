import { NO_PATTERN_BUSINESS_LOGIC } from '@vfde-brix/ws10/core';
import { IItemSummaryCardItemProperties } from '@vfde-brix/ws10/item-summary-card';
import { ADDITIONAL_PAGE_OPTIONS } from '@vfde-sails/constants';
import { getTauschbonusAmount } from '@vfde-sails/page-options';
import { replacePlaceholders } from '@vfde-sails/utils';
import { RootState } from '../../../app/store';
import {
    selectDeviceId,
    selectIsTauschbonus,
} from '../../../features/App/selectors';
import { selectSelectedTradeInDevice } from '../selectors';

const getTradeInItemSummaryCardProps = (state: RootState): IItemSummaryCardItemProperties[] => {

    const { tradeIn: tradeInOptions, tauschbonus: tauschbonusOptions } = window[ADDITIONAL_PAGE_OPTIONS].promos;
    const deviceId = selectDeviceId(state) as string;
    const isTauschbonus = selectIsTauschbonus(state);
    const selectedTradeInDevice = selectSelectedTradeInDevice(state);

    const tauschbonusValue = getTauschbonusAmount(deviceId);

    const newProps: IItemSummaryCardItemProperties = {
        containerCopytext: '',
        optIconButton: true,
        image: {},
        stdHeadline: '',
        stdSubline: '',
        business: NO_PATTERN_BUSINESS_LOGIC,
    };

    if (isTauschbonus) {
        newProps.containerCopytext = tauschbonusOptions && replacePlaceholders(tauschbonusOptions.tauschbonusSubline, { tauschbonusValue: `${tauschbonusValue}` });
    }

    const imgSrc = selectedTradeInDevice?.imgSrc;
    newProps.image = {
        imgSrcDesktop: imgSrc,
        imgSrcMobile: imgSrc,
        stdImgAlt: '',
    };
    newProps.stdHeadline = selectedTradeInDevice?.name || '';

    if (tradeInOptions?.itemSummaryCardSubline) {
        newProps.stdSubline = replacePlaceholders(
            tradeInOptions.itemSummaryCardSubline,
            { maxPrice: selectedTradeInDevice?.formattedPrice || '' },
        );
    }

    return [newProps];
};

export default getTradeInItemSummaryCardProps;
