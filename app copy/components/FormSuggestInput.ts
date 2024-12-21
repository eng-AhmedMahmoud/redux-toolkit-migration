import {
    createFormSuggestInput,
    FormSuggestInput,
    IFormSuggestInputItem,
    IFormSuggestInputProperties,
} from '@vfde-brix/ws10/form-suggest-input';
import { formValidation } from '@vfde-brix/ws10/validation';

/**
 * Mounts the FormSuggestInput
 */
const mountFormSuggestInput = (
    containerId: string,
    formSuggestInputProperties: IFormSuggestInputProperties,
): FormSuggestInput | null => {
    const containerElement = document.getElementById(containerId);

    if (!containerElement) {
        /* istanbul ignore next */
        return null;
    }

    const formSuggestInput = createFormSuggestInput(containerElement, formSuggestInputProperties);

    formValidation({
        formFields: [
            formSuggestInput,
        ],
    });

    return formSuggestInput;
};

/**
 * Updates the result list of the FormSuggestInput
 */
export const updateFormSuggestInputResults = (
    formSuggestInput: FormSuggestInput,
    items: IFormSuggestInputItem[],
): void => {
    formSuggestInput.updateResultList(items);
};

/**
 * Clears the input value and result list of the FormSuggestInput
 */
export const resetTradeInFormSuggestInput = (formSuggestInput: FormSuggestInput): void => {
    formSuggestInput.clearInputValue();
    formSuggestInput.updateResultList([]);
    formSuggestInput.update({ stdErrorKey: undefined }, true);
};

export default mountFormSuggestInput;

