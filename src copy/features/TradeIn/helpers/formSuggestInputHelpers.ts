import {
    FormSuggestInput,
    IFormSuggestInputItem,
} from '@vfde-brix/ws10/form-suggest-input';

/**
 * Clears the input value and result list of the FormSuggestInput
 */
export const resetTradeInFormSuggestInput = (formSuggestInput: FormSuggestInput): void => {
    formSuggestInput.clearInputValue();
    formSuggestInput.updateResultList([]);
    formSuggestInput.update({ stdErrorKey: undefined }, true);
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
