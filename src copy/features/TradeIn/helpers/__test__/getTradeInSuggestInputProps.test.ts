import { ADDITIONAL_PAGE_OPTIONS } from '@vfde-sails/constants';
import { getTradeInSuggestInputProps } from '../getTradeInSuggestInputProps';
import { TRADEIN_INPUT_DEBOUNCE_DURATION } from '../../../TradeIn/constants';
import {
    debounce,
    sanitizeInput,
} from '@vfde-sails/utils';
import { IFormSuggestInputItem } from '@vfde-brix/ws10/form-suggest-input';
import {
    setSelectedTradeInDeviceId,
    setSuggestInputValue,
} from '../../../TradeIn/slice';
import { getTradeInDevices } from '../../../../api/tradeIn';
import { useAppDispatch } from '../../../../app/store';
import { AdditionalPageOptions } from '../../../App/interfaces/additionalPageOptions';

jest.mock('@vfde-brix/ws10/core', () => ({
    NO_PATTERN_BUSINESS_LOGIC: {},
}));
jest.mock('@vfde-brix/ws10/loading-animation', () => ({
    LoadingAnimationSize: {
        Medium: 'medium',
    },
}));
jest.mock('@vfde-brix/ws10/validation', () => ({}));
jest.mock('@vfde-sails/utils', () => ({
    debounce: jest.fn(fn => fn),
    sanitizeInput: jest.fn(value => value),
}));
jest.mock('../../../TradeIn/slice', () => ({
    setSelectedTradeInDeviceId: jest.fn(),
    setSuggestInputValue: jest.fn(),
}));
jest.mock('../../../../api/tradeIn', () => ({
    getTradeInDevices: {
        initiate: jest.fn(),
    },
}));
jest.mock('../../../../app/store', () => ({
    useAppDispatch: jest.fn(),
}));

beforeEach(() => {
    (window as any)[ADDITIONAL_PAGE_OPTIONS] = {
        promos: {
            tradeIn: {
                suggestInputLabel: 'Tipp hier Dein Modell ein',
                suggestInputPlaceholder: 'Tipp hier Dein Smartphone-Modell ein',
                deviceNotFoundText: 'Wir konnten das Modell leider nicht finden.',
                technicalErrorText: 'Technischer Fehler: Bitte versuch es später nochmal!',
            },
        },
    } as AdditionalPageOptions;
});

afterAll(() => {
    (window as any)[ADDITIONAL_PAGE_OPTIONS] = {} as AdditionalPageOptions;
});

describe('getTradeInSuggestInputProps', () => {
    it('should return the trade in suggestion input properties', () => {
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
        const result = getTradeInSuggestInputProps();

        expect(result).toMatchObject(mockedProps);
    });

    it('should debounce getTradeInDevices call on onInput', () => {
        const dispatchMock = jest.fn();
        (useAppDispatch as jest.Mock).mockReturnValue(dispatchMock);

        const result = getTradeInSuggestInputProps();

        const mockEvent = new Event('input');
        const value = 'test value';

        result?.business?.onInput?.(mockEvent, value);

        expect(dispatchMock).toHaveBeenCalledWith(setSuggestInputValue(value));
        expect(dispatchMock).toHaveBeenCalledWith(getTradeInDevices.initiate(value));
        expect(debounce).toHaveBeenCalledWith(expect.any(Function), TRADEIN_INPUT_DEBOUNCE_DURATION);
    });

    it('should call onInput from onChange event', () => {
        const dispatchMock = jest.fn();
        (useAppDispatch as jest.Mock).mockReturnValue(dispatchMock);

        const result = getTradeInSuggestInputProps();
        const mockEvent = new Event('change');
        const value = 'changed value';

        result?.business?.onChange?.(mockEvent, value);

        expect(dispatchMock).toHaveBeenCalledWith(setSuggestInputValue(value));
        expect(dispatchMock).toHaveBeenCalledWith(getTradeInDevices.initiate(value));
    });

    it('should call setSelectedTradeInDeviceId on onSelect', () => {
        const dispatchMock = jest.fn();
        (useAppDispatch as jest.Mock).mockReturnValue(dispatchMock);

        const result = getTradeInSuggestInputProps();
        const mockEvent = new Event('select');
        const item: IFormSuggestInputItem = { id: 'device123', text: 'device 1' };

        result?.business?.onSelect?.(mockEvent, item);

        expect(dispatchMock).toHaveBeenCalledWith(setSelectedTradeInDeviceId(item.id!));
    });

    it('should handle missing tradeIn properties gracefully', () => {
        (window as any)[ADDITIONAL_PAGE_OPTIONS] = {
            promos: {
                tradeIn: {},
            },
        };

        const result = getTradeInSuggestInputProps();

        expect(result.stdLabel).toBeUndefined();
    });

    it('should handle missing promos object gracefully', () => {
        (window as any)[ADDITIONAL_PAGE_OPTIONS] = {};

        const result = getTradeInSuggestInputProps();

        expect(result.stdLabel).toBeUndefined();
    });

    it('should sanitize input values before dispatching', () => {
        const dispatchMock = jest.fn();
        (useAppDispatch as jest.Mock).mockReturnValue(dispatchMock);

        const sanitizedValue = 'sanitized value';
        (sanitizeInput as jest.Mock).mockReturnValue(sanitizedValue);

        const result = getTradeInSuggestInputProps();
        const mockEvent = new Event('input');
        const value = 'test value';

        result?.business?.onInput?.(mockEvent, value);

        expect(sanitizeInput).toHaveBeenCalledWith(value);
        expect(dispatchMock).toHaveBeenCalledWith(setSuggestInputValue(sanitizedValue));
        expect(dispatchMock).toHaveBeenCalledWith(getTradeInDevices.initiate(sanitizedValue));
    });

    it('should set optDisabled to false by default', () => {
        const result = getTradeInSuggestInputProps();

        expect(result.optDisabled).toBe(false);
    });

    it('should set optDisableFiltering to true by default', () => {
        const result = getTradeInSuggestInputProps();

        expect(result.optDisableFiltering).toBe(true);
    });
});
