import {
    Accordion,
    ACCORDION_BASE_CLASSNAME,
    createAccordion,
    IAccordionProperties,
    IAccordionBusinessLogic,
} from '@vfde-brix/ws10/accordion';
import { NO_PATTERN_BUSINESS_LOGIC } from '@vfde-brix/ws10/core';
import {
    createComponent,
    IPatternWithNoPatternBusinessLogic,
} from '@vfde-brix/ws10/core';
import { OptionsActionDispatchers } from '../container/Options/slice';

/**
 * Mount Accordion component from element
 */
export const mountAccordion = (
    container: Element,
    properties: IAccordionProperties | IPatternWithNoPatternBusinessLogic = NO_PATTERN_BUSINESS_LOGIC,
): Accordion => createAccordion(container, properties);

/**
 * Mount Accordion component by ID
 */
export const mountAccordionById = (
    containerId: string,
    properties: IAccordionProperties | IPatternWithNoPatternBusinessLogic = NO_PATTERN_BUSINESS_LOGIC,
): Accordion => {
    const container = document.getElementById(containerId) as HTMLElement;

    return mountAccordion(container, properties);
};

/**
 * Mount all other editorial accordions
 */
export const mountEditorialAccordions = (
    excludes: string[] = [],
    onToggle?: OptionsActionDispatchers['toggleAccordion'],
    dom: Document | HTMLElement = document,
) => {
    const elements = dom.getElementsByClassName(ACCORDION_BASE_CLASSNAME);
    const business: IAccordionBusinessLogic = onToggle ? { onToggle } : {};

    for (let i = 0, x = elements.length; i < x; i += 1) {
        const containerElement = elements[i].parentElement;

        if (containerElement && !excludes.includes(containerElement.id)) {
            createComponent(mountAccordion, containerElement, business);
        }
    }
};
