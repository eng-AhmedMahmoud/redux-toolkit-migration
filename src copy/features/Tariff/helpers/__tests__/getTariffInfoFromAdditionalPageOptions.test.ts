import { RED_XS_VIRTUAL_ID } from '@vfde-sails/constants';
import { getPibs } from '../getTariffInfoFromAdditionalPageOptions';

describe('getTariffInfoFromAdditionalPageOptions', () => {
    const oldWindow = window;
    const pdfLink = 'IamAPDF.com';

    beforeEach(() => {
        (window as any).additionalPageOptions = {
            pibs: {
                133: 'IamAPDF.com',
            },
        };
    });

    afterEach(() => {
        window = oldWindow;
    });

    it('should get the right pibs link for the the current subscription ID (Red XS)', () => {
        expect(getPibs(RED_XS_VIRTUAL_ID)).toEqual(pdfLink);
    });

    it('should return undefined for invalid subscription Id', () => {
        expect(getPibs('8888')).toEqual(undefined);
    });
});
