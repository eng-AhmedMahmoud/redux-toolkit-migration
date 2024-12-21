import { mountAccordionTable } from './Table';
import {
    Accordion,
    AccordionVariant,
    IAccordionItemProperties,
} from '@vfde-brix/ws10/accordion';
import { ADDITIONAL_PAGE_OPTIONS } from '@vfde-sails/constants';
import { createId } from '@vfde-sails/utils';
import {
    CLASSNAME_HIDDEN,
    ListType,
    renderList,
} from '@vfde-brix/ws10/styles';
import { OptionsActionDispatchers } from 'app/container/Options/slice';
import { TECHNICAL_DETAILS_ACCORDION_CONTAINER_ID } from '../container/Options/constants';
import { StateProps } from 'app/container/Options/interface';
import { mountAccordionById } from './Accordion';
import { HEADLINE_BASE_CLASSNAME } from '@vfde-brix/ws10/headline';

/**
 * Mounts the technical-details accordion
 * @param toggleAccordion toggle action
 */
export const mountTechnicalDetailsAccordion = (
    toggleAccordion: OptionsActionDispatchers['toggleAccordion'],
): Accordion | null => mountAccordionById(TECHNICAL_DETAILS_ACCORDION_CONTAINER_ID, {
    items: [],
    optOpenIndividually: true,
    optVariant: AccordionVariant.Flat,
    business: {
        onToggle: toggleAccordion,
    },
});

/**
 * Mounts the technical-details accordion
 * @param accordion The accordion component
 * @param technicalDetails TechnicalDetails data
 * @param deliveryScope deliveryScope data
 * so we can store the CMS accordion item IDs
 */
export const updateTechnicalDetailsAccordion = (
    accordion: Accordion,
    technicalDetails: StateProps['technicalDetails'],
    deliveryScope: StateProps['deliveryScope'],
): Accordion | null => {
    const items: IAccordionItemProperties[] = [
        ...createTechnicalDetailsData(technicalDetails),
        createDeliveryScopeData(deliveryScope!),
    ];

    const accordionElement = document.getElementById(TECHNICAL_DETAILS_ACCORDION_CONTAINER_ID) as HTMLElement;

    if (accordionElement) {
        const headlineElement = accordionElement.previousElementSibling;
        const hasHeadlineElement = accordionElement.previousElementSibling?.classList.contains(HEADLINE_BASE_CLASSNAME);
        hasHeadlineElement && headlineElement && headlineElement.classList.remove(CLASSNAME_HIDDEN);
    }

    accordion.update({
        items,
        optOpenIndividually: true,
    });

    return accordion;
};

const createTechnicalDetailsData = (technicalDetails: StateProps['technicalDetails']): IAccordionItemProperties[] => {
    const accordionItems: IAccordionItemProperties[] = [];
    let i = 0;

    for (const [sectionLabel, section] of Object.entries(technicalDetails!)) {
        const tableContainer = document.createElement('div');

        mountAccordionTable(tableContainer, section.attributes);

        const stdId = createId(sectionLabel, undefined, i.toString());
        const stdIconLeft = window[ADDITIONAL_PAGE_OPTIONS].technicalDetails.icons[section.id];

        accordionItems.push({
            stdId,
            stdHeadline: sectionLabel,
            containerAnyComponent: tableContainer.innerHTML,
            stdIconLeft,
        });

        i++;
    }

    return accordionItems;
};

const createDeliveryScopeData = (deliveryScope: string[]): IAccordionItemProperties => {
    const deliveryScopeElement = document.createElement('div');

    deliveryScopeElement.innerHTML = renderList(deliveryScope, ListType.Bullet);

    return {
        stdId: createId(window[ADDITIONAL_PAGE_OPTIONS].technicalDetails.headline, 'vvl-ddp-delivery-scope'),
        stdHeadline: window[ADDITIONAL_PAGE_OPTIONS].technicalDetails.headline,
        containerAnyComponent: deliveryScopeElement.innerHTML,
        stdIconLeft: 'bundles',
    };
};
