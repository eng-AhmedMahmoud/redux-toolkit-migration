import { useAppDispatch } from '../../app/store';
import './style.scss';

import initTariff from '../Tariff';
import { mountTechnicalDetailsAccordion } from './components/AccordionForTechnicalDetails';
import { mountDeliveryDateIconText } from './components/IconTextForDeliveryDate';
import { prepareImageGallery } from './components/ImageGallery';

import { mountCapacityOptionPicker } from './components/OptionPickerForCapacity';
import { mountColorOptionPicker } from './components/OptionPickerForColor';
import { mountTextHeader } from './components/TextHeader';
import { getAtomicId } from './helpers/getAtomicId';

import { startListeners } from './listeners';
import { setDefaultState } from './slice';
import {
    CAPACITY_OPTION_PICKER_CONTAINER_ID,
    COLOR_OPTION_PICKER_CONTAINER_ID,
    DELIVERY_DATE_CONTAINER_ID,
    IMAGE_GALLERY_CONTAINER_ID,
    TECHNICAL_DETAILS_ACCORDION_CONTAINER_ID,
    TEXT_HEADER_CONTAINER_ID,
} from './constants';

/**
 * Init options
 */
export const initOptions = () => {
    startListeners();

    const dispatch = useAppDispatch();
    dispatch(setDefaultState(getAtomicId()));

    mountTextHeader(TEXT_HEADER_CONTAINER_ID);
    prepareImageGallery(IMAGE_GALLERY_CONTAINER_ID);

    mountColorOptionPicker(COLOR_OPTION_PICKER_CONTAINER_ID);
    mountCapacityOptionPicker(CAPACITY_OPTION_PICKER_CONTAINER_ID);

    mountDeliveryDateIconText(DELIVERY_DATE_CONTAINER_ID);
    mountTechnicalDetailsAccordion(TECHNICAL_DETAILS_ACCORDION_CONTAINER_ID);

    initTariff();
};
