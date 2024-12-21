import { NO_PATTERN_BUSINESS_LOGIC } from '@vfde-brix/ws10/core';
import {
    createImageGallery,
    IImageGalleryItem,
    IMAGE_GALLERY_MAX_ITEM_COUNT,
    ImageGallery,
} from '@vfde-brix/ws10/image-gallery';
import { Cellular } from '@vfde-sails/glados-v2';
import { startAppListening } from '../../../app/listener';
import { getImageGalleryIcon } from '../helpers/getImageGalleryIcon';
import {
    selectAtomicImages,
    selectCellular,
} from '../selectors';

let imageGallery: ImageGallery | null = null;

/**
 * Prepares the mounting of the ImageGallery
 */
export const prepareImageGallery = (containerId: string) => {
    startAppListening({
        predicate: (_action, currentState, previousState) => {
            const currentAtomicImages = selectAtomicImages(currentState);
            const previousAtomicImages = selectAtomicImages(previousState);

            return !!(
                (currentAtomicImages && previousAtomicImages === null)
                || (currentAtomicImages && previousAtomicImages && currentAtomicImages !== previousAtomicImages)
            );
        },
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const atomicImages = selectAtomicImages(state)!;
            const cellular = selectCellular(state);

            imageGallery = mountOrUpdateImageGallery(imageGallery, containerId, atomicImages, cellular);
        },
    });

    startAppListening({
        predicate: (_action, currentState, previousState) =>
            selectCellular(currentState) !== selectCellular(previousState),
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const cellular = selectCellular(state);

            imageGallery && updateImageGalleryIcon(imageGallery, cellular);
        },
    });
};

/**
 * Mounts a new ImageGallery component or updates the existing one
 */
const mountOrUpdateImageGallery = (
    gallery: ImageGallery | null,
    containerId: string,
    images: string[],
    cellular: Cellular | null,
): ImageGallery | null => {
    if (gallery) {
        updateImageGalleryImages(gallery, images);
        updateImageGalleryIcon(gallery, cellular);

        return imageGallery;
    }

    const containerElement = document.getElementById(containerId);

    /* istanbul ignore if */
    if (!containerElement) {
        return null;
    }

    const items: IImageGalleryItem[] = convertImagesToImageGalleryItems(images);
    const stdIconName = getImageGalleryIcon(cellular);

    return createImageGallery(containerElement, {
        items,
        stdIconName,
        business: NO_PATTERN_BUSINESS_LOGIC,
    });
};

/**
 * Updates the ImageGallery images separately
 */
const updateImageGalleryImages = (gallery: ImageGallery, images: string[]) => {
    const items = convertImagesToImageGalleryItems(images);

    gallery.updateItems(items, true, false);
};

/**
 * Update ImageGallery icon separately
 */
const updateImageGalleryIcon = (
    gallery: ImageGallery,
    cellular: Cellular | null,
) => {
    gallery.updateIcon(getImageGalleryIcon(cellular));
};

/**
 * Converts the image array to an array of imageGalleryItems
 */
const convertImagesToImageGalleryItems = (images: string[]): IImageGalleryItem[] => {
    const items: IImageGalleryItem[] = [];

    for (let i = 0, iLen = Math.min(images.length, IMAGE_GALLERY_MAX_ITEM_COUNT); i < iLen; i++) {
        items.push({
            imgSrc: images[i],
            stdImgAlt: '',
        });
    }

    return items;
};
