import {
    BeltContainer,
    createBeltContainer,
} from '@vfde-brix/ws10/belt-container';
import { NO_PATTERN_BUSINESS_LOGIC } from '@vfde-brix/ws10/core';

/**
 * Mounts a BeltContainer by ID
 */
const mountBeltContainer = (containerId: string): BeltContainer | null => {
    const containerElement = document.getElementById(containerId);

    if (!containerElement) {
        /* istanbul ignore next */
        return null;
    }

    const beltContainer = createBeltContainer(containerElement, NO_PATTERN_BUSINESS_LOGIC);

    return beltContainer;
};

export default mountBeltContainer;
