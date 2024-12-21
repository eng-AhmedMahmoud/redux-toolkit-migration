import {
    createFormSuggestInput,
    FormSuggestInput,
    IFormSuggestInputProperties,
} from '@vfde-brix/ws10/form-suggest-input';
import { formValidation } from '@vfde-brix/ws10/validation';
import { startAppListening } from '../../../app/listener';
import {
    selectSelectedTradeInDevice,
    selectIsLoading,
    selectTradeInDevices,
    selectIsTradeInSelected,
} from '../selectors';
import formatAndSortTradeInResponse from '../helpers/formatAndSortTradeInResponse';
import { getTradeInSuggestInputProps } from '../helpers/getTradeInSuggestInputProps';
import { isEqual } from 'lodash';
import {
    resetTradeInFormSuggestInput,
    updateFormSuggestInputResults,
} from '../helpers/formSuggestInputHelpers';

/**
 * Mounts the FormSuggestInput for tradeIn
 */
export const mountTradeInFormSuggestInput = (containerId: string): FormSuggestInput | null => {
    const containerElement = document.getElementById(containerId);

    /* istanbul ignore if */
    if (!containerElement) {
        return null;
    }

    const formSuggestInput = createFormSuggestInput(containerElement, getTradeInSuggestInputProps() as IFormSuggestInputProperties);

    formValidation({
        formFields: [
            formSuggestInput,
        ],
    });

    listenForUpdates(formSuggestInput);

    return formSuggestInput;
};

const listenForUpdates = (formSuggestInput: FormSuggestInput) => {
    startAppListening({
        predicate: (_action, currentState, previousState) =>{
            const selectedTradeInDeviceChanged = selectSelectedTradeInDevice(currentState) !== selectSelectedTradeInDevice(previousState);

            return selectedTradeInDeviceChanged && !!selectSelectedTradeInDevice(currentState);
        }
        , effect: ()=> {
            // if a new device was selected, so we reset the formSuggestInput
            formSuggestInput && resetTradeInFormSuggestInput(formSuggestInput);
        },
    });

    startAppListening({
        predicate: (_action, currentState, previousState) =>
            !selectSelectedTradeInDevice(currentState) && selectIsLoading(currentState) !== selectIsLoading(previousState)
        ,
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const isLoading = selectIsLoading(state);

            formSuggestInput?.toggleLoadingAnimation(isLoading);
        },
    });

    startAppListening({
        predicate: (_action, currentState, previousState) =>
            !selectSelectedTradeInDevice(currentState) && !isEqual(selectTradeInDevices(currentState), selectTradeInDevices(previousState))
        ,
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const tradeInDevices = selectTradeInDevices(state);
            // device list has changed, so we update the formSuggestInput results
            formSuggestInput && updateFormSuggestInputResults(formSuggestInput, formatAndSortTradeInResponse(tradeInDevices!));

        },
    });

    startAppListening({
        predicate: (_action, currentState) =>
            !selectSelectedTradeInDevice(currentState) && selectIsTradeInSelected(currentState)
        ,
        effect: () => {
            // if there is no selectedTradeInDevice but tradeIn picker is 'yes'
            // show formSuggestInput so the user can type the device name
            formSuggestInput?.toggleContainer(false, true);
        },
    });

    startAppListening({
        predicate: (_action, currentState) =>
            !!selectSelectedTradeInDevice(currentState) && selectIsTradeInSelected(currentState)
        ,
        effect: () => {
            formSuggestInput && (
                formSuggestInput?.toggleContainer(true, true),
                resetTradeInFormSuggestInput(formSuggestInput)
            );
        },
    });

    startAppListening({
        predicate: (_action, currentState) =>
            !selectIsTradeInSelected(currentState)
        ,
        effect: () => {
            // in this case tradeIn picker is 'no'
            // but `newState.selectedTradeInDevice` could be set or not
            // (user deactivated tradeIn with a selected device)
            // so we hide formSuggestInput
            formSuggestInput && (
                formSuggestInput?.toggleContainer(true, true),
                resetTradeInFormSuggestInput(formSuggestInput)
            );
        },
    });
};

