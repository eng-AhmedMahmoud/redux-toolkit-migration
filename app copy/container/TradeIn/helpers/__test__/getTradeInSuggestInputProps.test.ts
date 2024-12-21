import { ADDITIONAL_PAGE_OPTIONS } from '@vfde-sails/constants';
import { AdditionalPageOptions } from 'Container/App/interfaces/additionalPageOptions';
import { getTradeInSuggestInputProps } from '../getTradeInSuggestInputProps';
import { tradeInActionDispatchers } from 'Container/TradeIn/slice';
import { TRADEIN_INPUT_DEBOUNCE_DURATION } from 'Container/TradeIn/constants';
import { debounce } from '@vfde-sails/utils';
import { IFormSuggestInputItem } from '@vfde-brix/ws10/form-suggest-input';

jest.mock('@vfde-brix/ws10/core', () => ({
    NO_PATTERN_BUSINESS_LOGIC: {},
}));
jest.mock('@vfde-brix/ws10/loading-animation', () => ({
    LoadingAnimationSize: {
        Medium: 'medium',
    },
}));
jest.mock('@vfde-brix/ws10/validation', () => ({
}));
jest.mock('@vfde-sails/utils', () => ({
    debounce: jest.fn(fn => fn),
}));
jest.mock('Container/TradeIn/slice', ()=> ({
    ...jest.requireActual('Container/TradeIn/slice'),
    tradeInActionDispatchers: { getTradeInDevices: jest.fn(),
        setSuggestInputValue: jest.fn(),
        setSelectedTradeInDeviceId: jest.fn() },
}));

beforeEach(() => {
    window[ADDITIONAL_PAGE_OPTIONS] = {
        promos: {
            'tradeIn': {
                'suggestInputLabel': 'Tipp hier Dein Modell ein',
                'suggestInputPlaceholder': 'Tipp hier Dein Smartphone-Modell ein',
                'deviceNotFoundText': 'Wir konnten das Modell leider nicht finden.',
                'technicalErrorText': 'Technischer Fehler: Bitte versuch es später nochmal!',
            },
        },
    } as AdditionalPageOptions;
});

afterAll(() => {
    window[ADDITIONAL_PAGE_OPTIONS] = {} as AdditionalPageOptions;
});

describe('get Trade In Suggest Input Properties', () => {
    it('should return the trade in suggestion input properties', ()=>{
        const mockedProps = {
            stdId: 'vvl-hardware-details-tradein-input',
            stdName: 'vvl-hardware-details-tradein-input',
            stdLabel: 'Tipp hier Dein Modell ein',
            optDisabled: false,
            optDisableFiltering: true,
            optWithLoadingAnimation: true,
            optLoadingAnimationSize: 'medium',
            containerLabel: {
                business: {},
            },
            containerInput: {
                stdPlaceholder: 'Tipp hier Dein Smartphone-Modell ein',
                optType: 'text',
            },
            business: {
                validation: expect.arrayContaining([
                    expect.objectContaining({ errorKey: 'tradeInInputRequired', validator: undefined }),
                ]),
            },
        };
        const result = getTradeInSuggestInputProps(tradeInActionDispatchers);

        expect(result).toMatchObject(mockedProps);
    });

    it('should debounce getTradeInDevices call on onInput', () => {
        const result = getTradeInSuggestInputProps(tradeInActionDispatchers);

        const mockEvent = new Event('input');
        const value = 'test value';

        result?.business?.onInput?.(mockEvent, value);

        expect(tradeInActionDispatchers.setSuggestInputValue).toHaveBeenCalledWith(value);
        expect(tradeInActionDispatchers.getTradeInDevices).toHaveBeenCalled();
        expect(debounce).toHaveBeenCalledWith(expect.any(Function), TRADEIN_INPUT_DEBOUNCE_DURATION);
    });

    it('should call onInput from onChange event', () => {
        const result = getTradeInSuggestInputProps(tradeInActionDispatchers);
        const mockEvent = new Event('change');
        const value = 'changed value';

        result?.business?.onChange?.(mockEvent, value);
        expect(tradeInActionDispatchers.setSuggestInputValue).toHaveBeenCalledWith(value);
        expect(tradeInActionDispatchers.getTradeInDevices).toHaveBeenCalled();
    });

    it('should call setSelectedTradeInDeviceId on onSelect', () => {
        const result = getTradeInSuggestInputProps(tradeInActionDispatchers);
        const mockEvent = new Event('select');
        const item: IFormSuggestInputItem = { id: 'device123', text: 'device 1' };

        result?.business?.onSelect?.(mockEvent, item);

        expect(tradeInActionDispatchers.setSelectedTradeInDeviceId).toHaveBeenCalledWith(item.id);
    });

});
