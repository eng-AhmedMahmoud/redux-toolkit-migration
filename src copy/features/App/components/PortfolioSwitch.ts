import { OptionPicker } from '@vfde-brix/ws10/option-picker';
import {
    mountOptionPicker,
    updateOptionPickerItems,
} from '../../../components/OptionPicker';
import { selectSalesChannel } from '../selectors';
import { startAppListening } from '../../../app/listener';
import {
    SALESCHANNEL_CONSUMER,
    SALESCHANNEL_YOUNG,
    SalesChannel,
} from '@vfde-sails/constants';
import { setSalesChannel } from '../slice';
import {
    toggleElementById,
    toggleTariffOptionPickers,
} from '../../../helpers/domHelper';
import { useAppDispatch } from '../../../app/store';
import { PORTFOLIO_SWITCH_CONTAINER_ID } from '../constants';
import { getIsYoungEligible } from '../../../helpers/getUserDataHelper';

/**
 * Mount Portfolio Switch
 * @param containerId the id of the container element
 */
export const mountPortfolioSwitch = (containerId:string) : OptionPicker | null=>{
    const onChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const salesChannel = target.value as Extract<SalesChannel, typeof SALESCHANNEL_CONSUMER | typeof SALESCHANNEL_YOUNG>;
        const dispatch = useAppDispatch();

        dispatch(setSalesChannel(salesChannel));
    };

    const portfolioSwitch = mountOptionPicker(containerId, { onChange });

    if (!portfolioSwitch) {
        return null;
    }

    const isYoungEligible = getIsYoungEligible();

    if (isYoungEligible) {
        toggleElementById(PORTFOLIO_SWITCH_CONTAINER_ID, false);
    }

    listenForUpdates(portfolioSwitch);

    return portfolioSwitch;
};

const listenForUpdates = (portfolioSwitch: OptionPicker) => {
    startAppListening({
        predicate: (_action, currentState, previousState) => selectSalesChannel(currentState) !== selectSalesChannel(previousState) && !!selectSalesChannel(currentState),
        effect: (_action, listenerApi) => {
            const salesChannel = selectSalesChannel(listenerApi.getState());

            if (!salesChannel) {
                return;
            }

            const { items } = portfolioSwitch.getProperties();

            items.forEach(item => {
                item.optChecked = false;

                if (item.stdValue === salesChannel) {
                    item.optChecked = true;
                }
            });

            updateOptionPickerItems(portfolioSwitch, items);
            toggleTariffOptionPickers(salesChannel);
        },
    });
};
