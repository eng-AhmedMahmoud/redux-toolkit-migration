import { BeltContainer } from '@vfde-brix/ws10/belt-container';
import { startAppListening } from '../../../app/listener';
import mountBeltContainer from '../../../components/BeltContainer';
import { selectHasError } from '../selectors';
import {
    ERROR_NOTIFICATION_CONTAINER_ID,
    HTML_CONTAINER_ID_PREFIX,
} from '../../../features/App/constants';
import { toggleElementById } from '../../../helpers/domHelper';
import { LOADING_INDICATOR_CSS_SELECTOR } from '@vfde-sails/constants';

/**
 * mountApp belt container function
 * @param containerId the id of the container
 * @returns BeltContainer component
 */
export const mountAppBeltContainer = (containerId: string) : BeltContainer | null=> {
    const beltContainer = mountBeltContainer(containerId);

    if (!beltContainer) {
        return null;
    }

    listenForUpdates(beltContainer, containerId);

    return beltContainer;
};

const listenForUpdates = (beltContainer: BeltContainer, containerId: string )=>{
    startAppListening({
        predicate: (_actions, currentState, prevState) =>
            selectHasError(prevState) !== selectHasError(currentState) && selectHasError(currentState),
        effect: () => {
            if (containerId === ERROR_NOTIFICATION_CONTAINER_ID) {
                beltContainer.toggleContainer(false);
            }
            else if (containerId === HTML_CONTAINER_ID_PREFIX) {
                beltContainer.toggleContainer(true);
            }

            toggleElementById(LOADING_INDICATOR_CSS_SELECTOR);
        },
    });
};
