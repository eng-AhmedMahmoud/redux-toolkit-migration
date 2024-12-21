import {
    createImageGallery,
    IImageGalleryItem,
    IMAGE_GALLERY_MAX_ITEM_COUNT,
    ImageGallery,
} from '@vfde-brix/ws10/image-gallery';
import { getImageGalleryIcon } from '../container/Options/helpers/getImageGalleryIcon';
import { NO_PATTERN_BUSINESS_LOGIC } from '@vfde-brix/ws10/core';
import { Cellular } from '@vfde-sails/glados-v2';

/**
 * Mounts a new ImageGallery component or updates the existing one
 */
const mountOrUpdateImageGallery = (
    imageGallery: ImageGallery | null,
    containerId: string,
    images: string[],
    cellular: Cellular | null,
): ImageGallery | null => {
    if (imageGallery) {
        updateImageGalleryImages(imageGallery, images);
        updateImageGalleryIcon(imageGallery, cellular);

        return imageGallery;
    }

    const containerElement = document.getElementById(containerId);

    if (!containerElement) {
        /* istanbul ignore next */
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

export default mountOrUpdateImageGallery;

/**
 * Updates the ImageGallery images separately
 */
const updateImageGalleryImages = (imageGallery: ImageGallery, images: string[]) => {
    const items = convertImagesToImageGalleryItems(images);

    imageGallery.updateItems(items, true, false);
};

/**
 * Update ImageGallery icon separately
 */
export const updateImageGalleryIcon = (
    imageGallery: ImageGallery,
    cellular: Cellular | null,
) => {
    imageGallery.updateIcon(getImageGalleryIcon(cellular) || null);
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
