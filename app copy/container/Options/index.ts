import {
    connect,
    injectSaga,
    RootState,
} from '@vfde-sails/core';
import './style.scss';
import optionsSaga from './saga';
import { createStructuredSelector } from 'reselect';
import {
    selectAtomicId,
    selectCapacities,
    selectCapacitiesForColor,
    selectCellular,
    selectColors,
    selectCurrentCapacity,
    selectCurrentColor,
    selectDeliveryScope,
    selectDeviceName,
    selectDevicePayload,
    selectImages,
    selectShippingInfo,
    selectTechnicalDetails,
} from './selectors';
import {
    IInitialState as IInitialStateOptions,
    StateProps,
} from './interface';
import { updateImageGalleryIcon } from '../../components/ImageGallery';
import {
    CAPACITY_OPTION_PICKER_CONTAINER_ID,
    COLOR_OPTION_PICKER_CONTAINER_ID,
    DELIVERY_DATE_CONTAINER_ID,
    IMAGE_GALLERY_CONTAINER_ID,
} from './constants';
import {
    mountIconText,
    updateIconText,
} from '../../components/IconText';
import mountColorOptionPicker, { convertColorsFromApiToColorOptionPickerItems } from '../../components/ColorOptionPicker';
import mountCapacityOptionPicker, { convertCapacitiesFromApiToCapacityOptionPickerItems } from '../../components/CapacityOptionPicker';
import { TEXT_HEADER_CONTAINER_ID } from '../App/constants';
import {
    mountTextHeader,
    updateTextHeader,
} from '../../components/TextHeader';
import { IInitialState as IInitialStateApp } from '../App/interfaces/state';
import mountOrUpdateImageGallery from '../../components/ImageGallery';
import { ImageGallery } from '@vfde-brix/ws10/image-gallery';
import mountTariffContainer from '../Tariff';
import { getAtomicId } from './helpers/getAtomicId';
import optionsSlice, {
    OptionsActionDispatchers,
    optionsActionDispatchers,
} from './slice';
import { Accordion } from '@vfde-brix/ws10/accordion';
import {
    mountTechnicalDetailsAccordion,
    updateTechnicalDetailsAccordion,
} from '../../components/AccordionForTechnicalDetails';

function Options (state: StateProps, actions: OptionsActionDispatchers) {
    injectSaga(optionsSlice.name, optionsSaga);
    const { setDefaultState, changeColor, changeCapacity, toggleAccordion } = actions;

    // Set atomic Id in the default state
    setDefaultState(getAtomicId());

    const deliveryDateIconText = mountIconText(DELIVERY_DATE_CONTAINER_ID);
    const colorOptionPicker = mountColorOptionPicker(COLOR_OPTION_PICKER_CONTAINER_ID, changeColor);
    const capacityOptionPicker = mountCapacityOptionPicker(CAPACITY_OPTION_PICKER_CONTAINER_ID, changeCapacity);
    const textHeader = mountTextHeader(TEXT_HEADER_CONTAINER_ID);

    mountTariffContainer();

    let technicalDetailsAcordion: Accordion | null = null;
    let imageGallery: ImageGallery | null = null;

    return {
        getDerivedStateFromProps (newState: StateProps, oldState: StateProps) {
            const { technicalDetails, deliveryScope, availableColors, availableCapacities,
                capacitiesForColor, currentCapacity, images, cellular, shippingInfo, deviceName } = newState;
            textHeader && deviceName && updateTextHeader(textHeader, deviceName);
            technicalDetailsAcordion = mountTechnicalDetailsAccordion(toggleAccordion);

            if (technicalDetails && technicalDetails !== oldState.technicalDetails) {
                technicalDetailsAcordion && updateTechnicalDetailsAccordion(technicalDetailsAcordion, technicalDetails, deliveryScope!);
            }

            if (availableColors !== oldState.availableColors) {
                colorOptionPicker?.update({
                    items: convertColorsFromApiToColorOptionPickerItems(newState),
                });
            }

            if (
                availableCapacities !== oldState.availableCapacities
                || capacitiesForColor !== oldState.capacitiesForColor
                || currentCapacity !== oldState.currentCapacity
            ) {
                // either the available capacities, or the available capacities for the currently selected color or the currentCapacity
                capacityOptionPicker?.update({
                    items: convertCapacitiesFromApiToCapacityOptionPickerItems(newState),
                });
            }

            if (
                // Mount image gallery for the first time
                (images && oldState.images === null)
                // Mount image gallery afterward only if the images change, not if the atomic changes (which changes for same-colored capacity as well)
                || (images && oldState.images && images !== oldState.images)
            ) {
                imageGallery = mountOrUpdateImageGallery(
                    imageGallery,
                    IMAGE_GALLERY_CONTAINER_ID,
                    images,
                    cellular,
                );
            }

            if (cellular !== oldState.cellular) {
                imageGallery && updateImageGalleryIcon(imageGallery, cellular);
            }

            if (shippingInfo && shippingInfo !== oldState.shippingInfo) {
                deliveryDateIconText && updateIconText(deliveryDateIconText, shippingInfo.label);
            }
        },
    };
}

const mapStateToProps = createStructuredSelector<RootState<IInitialStateOptions & IInitialStateApp >, StateProps>({
    devicePayload: selectDevicePayload(),
    availableColors: selectColors(),
    availableCapacities: selectCapacities(),
    currentColor: selectCurrentColor(),
    currentCapacity: selectCurrentCapacity(),
    capacitiesForColor: selectCapacitiesForColor(),
    images: selectImages(),
    atomicId: selectAtomicId(),
    technicalDetails: selectTechnicalDetails(),
    shippingInfo: selectShippingInfo(),
    deliveryScope: selectDeliveryScope(),
    deviceName: selectDeviceName(),
    cellular: selectCellular(),
});

const mountOptionsContainer = connect(mapStateToProps, optionsActionDispatchers)(Options);

export default mountOptionsContainer;
