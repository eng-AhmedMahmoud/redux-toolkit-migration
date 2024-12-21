import {
    IAccordionItemProperties,
    Accordion,
    AccordionVariant,
    createAccordion,
} from '@vfde-brix/ws10/accordion';
import {
    NO_PATTERN_BUSINESS_LOGIC,
    createComponentById,
} from '@vfde-brix/ws10/core';
import {
    renderList,
    ListType,
    CLASSNAME_HIDDEN,
} from '@vfde-brix/ws10/styles';
import { ADDITIONAL_PAGE_OPTIONS } from '@vfde-sails/constants';
import { createId } from '@vfde-sails/utils';
import { startAppListening } from '../../../app/listener';
import {
    useAppDispatch,
    RootState,
} from '../../../app/store';
import {
    selectTechnicalDetails,
    selectDeliveryScope,
    selectActiveAccordionItemId,
} from '../selectors';
import { toggleAccordionItem } from '../slice';
import { mountTableForTechnicalDetails } from './TableForTechnicalDetails';
import { selectHasError } from '../../../features/App/selectors';
import { HEADLINE_BASE_CLASSNAME } from '@vfde-brix/ws10/headline';
import { TECHNICAL_DETAILS_ACCORDION_CONTAINER_ID } from '../constants';

/**
 * Mount the technical details accordion
 */
export const mountTechnicalDetailsAccordion = (containerId: string) => {
    const dispatch = useAppDispatch();

    const onToggle = (itemProperties: IAccordionItemProperties) => {
        dispatch(toggleAccordionItem(itemProperties));
    };

    const accordion = createComponentById(createAccordion, containerId, {
        items: [],
        optOpenIndividually: true,
        optVariant: AccordionVariant.Flat,
        business: {
            onToggle,
        },
    });

    /* istanbul ignore if */
    if (!accordion) {
        return null;
    }

    listenForUpdates(accordion);

    return accordion;
};

let cmsItemIds: string[];
let isFirstUpdate = true;

const listenForUpdates = (accordion: Accordion) => {
    startAppListening({
        predicate: (_action, currentState, previousState) =>
            selectTechnicalDetails(currentState) !== selectTechnicalDetails(previousState)
            || selectDeliveryScope(currentState) !== selectDeliveryScope(previousState)
            || selectActiveAccordionItemId(currentState) !== selectActiveAccordionItemId(previousState)
            || (selectHasError(currentState) && !selectHasError(previousState)),
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            updateTechnicalDetailsAccordion(state, accordion);
        },
    });
};

const updateTechnicalDetailsAccordion = (state: RootState, accordion: Accordion) => {
    const technicalDetails = selectTechnicalDetails(state);
    const deliveryScope = selectDeliveryScope(state);
    const activeAccordionItemId = selectActiveAccordionItemId(state);

    const accordionElement = document.getElementById(TECHNICAL_DETAILS_ACCORDION_CONTAINER_ID) as HTMLElement;

    if (accordionElement) {
        const headlineElement = accordionElement.previousElementSibling;
        const hasHeadlineElement = accordionElement.previousElementSibling?.classList.contains(HEADLINE_BASE_CLASSNAME);
        hasHeadlineElement && headlineElement && headlineElement.classList.remove(CLASSNAME_HIDDEN);
    }

    const tmpContainer = document.createElement('div');
    const items: IAccordionItemProperties[] = [
        ...createTechnicalDetailsData(technicalDetails),
        createDeliveryScopeData(deliveryScope),
    ];
    const tmpAccordion = createAccordion(tmpContainer, {
        items,
        optVariant: AccordionVariant.Flat,
        business: NO_PATTERN_BUSINESS_LOGIC,
    });
    const cmsItems = getItemsFromCMS(accordion, isFirstUpdate);

    if (isFirstUpdate) {
        cmsItemIds = cmsItems.map(item => item.stdId);
    }

    const mergedItems = [
        ...cmsItems,
        ...tmpAccordion.getPropertyByKey('items'),
    ];

    for (const item of mergedItems) {
        item.optOpen = !!activeAccordionItemId && item.stdId === activeAccordionItemId;
    }

    accordion.update({
        items: mergedItems,
        optOpenIndividually: true,
    });

    isFirstUpdate = false;
};

const getItemsFromCMS = (accordion: Accordion, isFirstCall: boolean): IAccordionItemProperties[] => {
    const cmsItems: IAccordionItemProperties[] = accordion.getPropertyByKey('items');
    const items: IAccordionItemProperties[] = [];

    for (const cmsItem of cmsItems) {
        const isWhitelisted = isFirstCall || cmsItemIds.includes(cmsItem.stdId);

        if (isWhitelisted) {
            /* istanbul ignore if */
            if (!cmsItem.containerAnyComponent.length) {
                continue;
            }

            items.push(cmsItem);
        }
    }

    return items;
};

const createTechnicalDetailsData = (technicalDetails: ReturnType<typeof selectTechnicalDetails>): IAccordionItemProperties[] => {
    if (!technicalDetails) {
        return [];
    }

    const accordionItems: IAccordionItemProperties[] = [];
    let i = 0;

    for (const [sectionLabel, section] of Object.entries(technicalDetails)) {
        const tableContainer = document.createElement('div');

        mountTableForTechnicalDetails(tableContainer, section.attributes);

        const stdId = createId(sectionLabel, undefined, i.toString());
        const stdIconLeft = window[ADDITIONAL_PAGE_OPTIONS]?.technicalDetails?.icons?.[section.id] || '';

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
        stdId: createId(window[ADDITIONAL_PAGE_OPTIONS].technicalDetails.headline, 'ddp-delivery-scope'),
        stdHeadline: window[ADDITIONAL_PAGE_OPTIONS].technicalDetails.headline,
        containerAnyComponent: deliveryScopeElement.innerHTML,
        stdIconLeft: 'bundles',
    };
};
