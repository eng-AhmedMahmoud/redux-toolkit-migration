import {
    SYSTEM_ICON_5G,
    SYSTEM_ICON_5G_PLUS,
} from '@vfde-brix/ws10/system-icon';
import { Cellular } from '@vfde-sails/glados-v2';

/**
 * Get Image Gallery Icon
 */
export const getImageGalleryIcon = (cellular: Cellular | null): string | undefined => {
    let imageGalleryIcon: string | undefined;

    switch (cellular) {
        case Cellular.FiveG:
            imageGalleryIcon = SYSTEM_ICON_5G;
            break;
        case Cellular.FiveGPlus:
            imageGalleryIcon = SYSTEM_ICON_5G_PLUS;
            break;
    }

    return imageGalleryIcon;
};
