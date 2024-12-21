import {
    TEXT_HEADER_CONTAINER_ID,
    IMAGE_GALLERY_CONTAINER_ID,
    DELIVERY_DATE_CONTAINER_ID,
    COLOR_OPTION_PICKER_CONTAINER_ID,
    CAPACITY_OPTION_PICKER_CONTAINER_ID,
    TECHNICAL_DETAILS_ACCORDION_CONTAINER_ID,
} from '../constants';
import { HTML_CONTAINER_ID_PREFIX } from '../../App/constants';

describe('Container ID Constants', () => {
    it('should have correct prefix for all container IDs', () => {
        expect(TEXT_HEADER_CONTAINER_ID).toBe(`${HTML_CONTAINER_ID_PREFIX}-text-header`);
        expect(IMAGE_GALLERY_CONTAINER_ID).toBe(`${HTML_CONTAINER_ID_PREFIX}-image-gallery`);
        expect(DELIVERY_DATE_CONTAINER_ID).toBe(`${HTML_CONTAINER_ID_PREFIX}-delivery-date`);
        expect(COLOR_OPTION_PICKER_CONTAINER_ID).toBe(`${HTML_CONTAINER_ID_PREFIX}-color-option-picker`);
        expect(CAPACITY_OPTION_PICKER_CONTAINER_ID).toBe(`${HTML_CONTAINER_ID_PREFIX}-capacity-option-picker`);
        expect(TECHNICAL_DETAILS_ACCORDION_CONTAINER_ID).toBe(`${HTML_CONTAINER_ID_PREFIX}-technical-details-accordion`);
    });

    it('should export string values', () => {
        expect(typeof TEXT_HEADER_CONTAINER_ID).toBe('string');
        expect(typeof IMAGE_GALLERY_CONTAINER_ID).toBe('string');
        expect(typeof DELIVERY_DATE_CONTAINER_ID).toBe('string');
        expect(typeof COLOR_OPTION_PICKER_CONTAINER_ID).toBe('string');
        expect(typeof CAPACITY_OPTION_PICKER_CONTAINER_ID).toBe('string');
        expect(typeof TECHNICAL_DETAILS_ACCORDION_CONTAINER_ID).toBe('string');
    });
});
