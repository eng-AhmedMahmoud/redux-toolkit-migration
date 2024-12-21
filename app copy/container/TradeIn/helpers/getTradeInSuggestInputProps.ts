import {
    IFormSuggestInputItem,
    IFormSuggestInputProperties,
} from '@vfde-brix/ws10/form-suggest-input';
import { ADDITIONAL_PAGE_OPTIONS } from '@vfde-sails/constants';
import {
    TRADEIN_INPUT_DEBOUNCE_DURATION,
    TRADEIN_INPUT_ID,
} from '../constants';
import { debounce } from '@vfde-sails/utils';
import { LoadingAnimationSize } from '@vfde-brix/ws10/loading-animation';
import { NO_PATTERN_BUSINESS_LOGIC } from '@vfde-brix/ws10/core';
import { required } from '@vfde-brix/ws10/validation';
import { TradeInActionDispatchers } from '../slice';

/**
 *  getTradeInSuggestInputProps returns the properties of tradeIn suggest input
 */
export const getTradeInSuggestInputProps = (actionDispatchers: TradeInActionDispatchers) : Partial<IFormSuggestInputProperties> => {
    const { tradeIn: tradeInOptions } = window[ADDITIONAL_PAGE_OPTIONS].promos || {};
    const stdId = TRADEIN_INPUT_ID;
    const stdLabel = tradeInOptions?.suggestInputLabel;
    const stdPlaceholder = tradeInOptions?.suggestInputPlaceholder || '';

    const debouncedOnInput = debounce(() => {
        actionDispatchers.getTradeInDevices();
    }, TRADEIN_INPUT_DEBOUNCE_DURATION);

    const onInput = (event: Event, value: string) => {
        actionDispatchers.setSuggestInputValue(value);
        debouncedOnInput();
    };

    const onChange = (event: Event, value: string) => {
    // onChange will be triggered on regular change events
    // and when the user clicks the 'x' icon to reset the input value
        onInput(event, value);
    };

    const onSelect = (event: Event, item: IFormSuggestInputItem) => {
        actionDispatchers.setSelectedTradeInDeviceId(item.id!);
    };

    const formSuggestInputProperties: Partial<IFormSuggestInputProperties> = {
        stdId,
        stdName: stdId,
        stdLabel,
        optDisabled: false,
        optDisableFiltering: true,
        optWithLoadingAnimation: true,
        optLoadingAnimationSize: LoadingAnimationSize.Medium,
        containerLabel: {
            business: NO_PATTERN_BUSINESS_LOGIC,
        },
        containerInput: {
            stdPlaceholder: stdPlaceholder,
            // the optType is needed here
            // to attach the correct event (blur instead of change)
            // for validation otherwise it won't work
            optType: 'text',
        },
        business: {
            onInput,
            onChange,
            onSelect,
            validation: [
                {
                    validator: required,
                    errorKey: 'tradeInInputRequired',
                },
            ],
        },
    };

    return formSuggestInputProperties;
};
