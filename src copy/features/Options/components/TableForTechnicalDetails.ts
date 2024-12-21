import {
    createTable,
    ITableRow,
    ITableProperties,
    Table,
} from '@vfde-brix/ws10/table';
import { NO_PATTERN_BUSINESS_LOGIC } from '@vfde-brix/ws10/core';
import { ADDITIONAL_PAGE_OPTIONS } from '@vfde-sails/constants';
import { renderTextLink } from '@vfde-brix/ws10/styles';

/**
 * Mount the simple table
 */
export const mountTableForTechnicalDetails = (
    container: HTMLElement,
    data: Record<string, string>,
): Table => {
    const listRow = [];
    const { key: ecoKey } = window[ADDITIONAL_PAGE_OPTIONS].ecoLabel;
    const specialValuesMap = new Map<string, CallableFunction>();

    specialValuesMap.set(ecoKey, getEcoLabel);

    for (const [label, value] of Object.entries(data)) {
        const specialValueFunction = specialValuesMap.get(label);
        const item: ITableRow = specialValueFunction ? specialValueFunction(label, value) : {
            stdLabel: label,
            stdText: value,
        };

        listRow.push(item);
    }

    const properties: ITableProperties = {
        listRow,
        business: NO_PATTERN_BUSINESS_LOGIC,
    };

    return createTable(container, properties);
};

const getEcoLabel = (label: string, value: string): ITableRow => {
    const { link, text } = window[ADDITIONAL_PAGE_OPTIONS].ecoLabel;

    const textLinkHtml = renderTextLink({
        stdContent: text,
        linkHref: link,
        optTarget: '_blank',
    });

    return {
        stdLabel: label,
        stdText: `${value} ${textLinkHtml}`,
    };
};
