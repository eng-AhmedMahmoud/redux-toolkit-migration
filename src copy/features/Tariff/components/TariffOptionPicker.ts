import {
    OptionPicker,
    IOptionPickerTextItem,
    OPTION_PICKER_TYPE_TEXT,
} from '@vfde-brix/ws10/option-picker';
import {
    RedTariff,
    YoungTariff,
} from '@vfde-sails/constants';
import { mountOptionPicker } from '../../../components/OptionPicker';
import { TARIFF_OPTION_PICKER_NAME } from '../constants';
import { useAppDispatch } from '../../../app/store';
import { setSubscriptionId } from '../slice';
import { startAppListening } from '../../../app/listener';
import {
    selectActiveOffer,
    selectActiveOffers,
    selectSubscriptionId,
} from '../selectors';
import { selectSalesChannel } from '../../App/selectors';
import { convertTariffsFromApiToTariffOptionPickerItems } from '../helpers/convertTariffsFromApiToTariffOptionPickerItems';

/**
 * Mount Tariff Option Picker
 */
export const mountTariffOptionPicker = (containerId: string): OptionPicker | null => {
    const dispatch = useAppDispatch();
    const items: IOptionPickerTextItem[] = [];

    const onChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        dispatch(setSubscriptionId(target.value as RedTariff | YoungTariff));
    };

    const tariffOptionPicker = mountOptionPicker(containerId, {
        optType: OPTION_PICKER_TYPE_TEXT,
        stdName: TARIFF_OPTION_PICKER_NAME,
        stdScreenreaderLegend: TARIFF_OPTION_PICKER_NAME,
        items,
        business: {
            onChange,
        },
    });

    /* istanbul ignore if */
    if (!tariffOptionPicker) {
        return null;
    }

    listenForUpdates(tariffOptionPicker);

    return tariffOptionPicker;
};

/**
 * listner to update Tariff Option Picker
 */
const listenForUpdates = (tariffOptionPicker: OptionPicker) => {
    startAppListening({
        predicate: (_action, currentState, previousState) => {
            const subscriptionIdChanged = selectSubscriptionId(currentState) !== selectSubscriptionId(previousState);
            const activeOfferChanged = selectActiveOffer(currentState) !== selectActiveOffer(previousState);

            return (selectActiveOffer(currentState) !== null && (activeOfferChanged || subscriptionIdChanged));
        },
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const salesChannel = selectSalesChannel(state);
            const subscriptionId = selectSubscriptionId(state);
            const offers = selectActiveOffers(state);

            tariffOptionPicker?.update({
                items: convertTariffsFromApiToTariffOptionPickerItems({
                    salesChannel,
                    subscriptionId,
                    offers,
                }),
            });
        },
    });
};
