import {
    Accordion,
    ACCORDION_BASE_CLASSNAME,
    createAccordion,
    IAccordionBusinessLogic,
    IAccordionItemProperties,
    IAccordionProperties,
} from '@vfde-brix/ws10/accordion';
import {
    createComponent,
    IPatternWithNoPatternBusinessLogic,
    NO_PATTERN_BUSINESS_LOGIC,
} from '@vfde-brix/ws10/core';
import { useAppDispatch } from '../app/store';
import { toggleAccordionItem } from '../features/Options/slice';

/**
 * Mount Accordion component from element
 */
export const mountAccordion = (
    container: Element,
    properties: IAccordionProperties | IPatternWithNoPatternBusinessLogic = NO_PATTERN_BUSINESS_LOGIC,
): Accordion => createAccordion(container, properties);

/**
 * Mount all other editorial accordions
 */
export const mountEditorialAccordions = (
    excludedContainerIds: string[],
    dom: Document | HTMLElement = document,
) => {
    const dispatch = useAppDispatch();

    /* istanbul ignore next */
    const onToggle = (itemProperties: IAccordionItemProperties) => {
        dispatch(toggleAccordionItem(itemProperties));
    };

    const elements = dom.getElementsByClassName(ACCORDION_BASE_CLASSNAME);
    const business: IAccordionBusinessLogic = { onToggle };

    for (let i = 0, x = elements.length; i < x; i += 1) {
        const containerElement = elements[i].parentElement;

        if (containerElement && !excludedContainerIds.includes(containerElement.id)) {
            createComponent(createAccordion, containerElement, business);
        }
    }
};
