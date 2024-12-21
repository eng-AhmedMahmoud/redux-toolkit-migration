import {
    FormSuggestInput,
    IFormSuggestInputItem,
} from '@vfde-brix/ws10/form-suggest-input';
import {
    resetTradeInFormSuggestInput,
    updateFormSuggestInputResults,
} from '../formSuggestInputHelpers';

jest.mock('@vfde-brix/ws10/form-suggest-input', () => ({
    FormSuggestInput: jest.fn().mockImplementation(() => ({
        clearInputValue: jest.fn(),
        updateResultList: jest.fn(),
        update: jest.fn(),
    })),
}));

describe('resetTradeInFormSuggestInput', () => {
    let formSuggestInput: FormSuggestInput;
    let mockElement: HTMLElement;
    let mockProperties: any;

    beforeEach(() => {
        mockElement = document.createElement('div');
        mockProperties = {};
        formSuggestInput = new FormSuggestInput(mockElement, mockProperties);
    });

    it('should clear input value and update result list and error key', () => {
        resetTradeInFormSuggestInput(formSuggestInput);

        expect(formSuggestInput.clearInputValue).toHaveBeenCalled();
        expect(formSuggestInput.updateResultList).toHaveBeenCalledWith([]);
        expect(formSuggestInput.update).toHaveBeenCalledWith({ stdErrorKey: undefined }, true);
    });

    it('should handle already cleared input value', () => {
        formSuggestInput.clearInputValue = jest.fn(() => { });

        resetTradeInFormSuggestInput(formSuggestInput);

        expect(formSuggestInput.clearInputValue).toHaveBeenCalled();
        expect(formSuggestInput.updateResultList).toHaveBeenCalledWith([]);
        expect(formSuggestInput.update).toHaveBeenCalledWith({ stdErrorKey: undefined }, true);
    });

    it('should not throw error if called multiple times', () => {
        expect(() => {
            resetTradeInFormSuggestInput(formSuggestInput);
            resetTradeInFormSuggestInput(formSuggestInput);
        }).not.toThrow();
    });
});

describe('updateFormSuggestInputResults', () => {
    let formSuggestInput: FormSuggestInput;
    let mockElement: HTMLElement;
    let mockProperties: any;

    beforeEach(() => {
        mockElement = document.createElement('div');
        mockProperties = {};
        formSuggestInput = new FormSuggestInput(mockElement, mockProperties);
    });

    it('should update the result list with provided items', () => {
        const items: IFormSuggestInputItem[] = [
            { id: '1', text: 'Item 1' },
            { id: '2', text: 'Item 2' },
        ];

        updateFormSuggestInputResults(formSuggestInput, items);

        expect(formSuggestInput.updateResultList).toHaveBeenCalledWith(items);
    });

    it('should handle empty items array', () => {
        const items: IFormSuggestInputItem[] = [];

        updateFormSuggestInputResults(formSuggestInput, items);

        expect(formSuggestInput.updateResultList).toHaveBeenCalledWith(items);
    });

    it('should update the result list with a single item', () => {
        const items: IFormSuggestInputItem[] = [{ id: '1', text: 'Single Item' }];

        updateFormSuggestInputResults(formSuggestInput, items);

        expect(formSuggestInput.updateResultList).toHaveBeenCalledWith(items);
    });

    it('should handle a large number of items', () => {
        const items: IFormSuggestInputItem[] = Array.from({ length: 1000 }, (_, i) => ({ id: String(i), text: `Item ${i}` }));

        updateFormSuggestInputResults(formSuggestInput, items);

        expect(formSuggestInput.updateResultList).toHaveBeenCalledWith(items);
    });
});
