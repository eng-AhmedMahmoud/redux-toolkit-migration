import {
    GIGAKOMBI_IP_TV,
    RED_M_VIRTUAL_ID,
    SAILS_PAGE_OPTIONS,
    SAILS_PARAM_CUSTOMER,
    SAILS_PARAM_SALESCHANNEL,
    SAILS_VVL_STORAGE,
    SALESCHANNEL_CONSUMER,
    SALESCHANNEL_YOUNG,
    YOUNG_M_VIRTUAL_ID,
    YOUNG_S_VIRTUAL_ID,
    YOUNG_XL_VIRTUAL_ID,
    YOUNG_XS_VIRTUAL_ID,
} from '@vfde-sails/constants';
import { getSessionStorageItemJson } from '@vfde-sails/storage';
import {
    PROMOTIONAL_SUMMARY_CARD_CONTAINER_ID,
    PROMOTIONAL_SUMMARY_CARD_CONTENT,
    PROMOTIONAL_SUMMARY_CARD_DATA_VOLUME,
    PROMOTIONAL_SUMMARY_CARD_HEADER_ICON_TEXT,
    PROMOTIONAL_SUMMARY_CARD_HEADER_YOUNG_ICON_TEXT,
    PROMOTIONAL_SUMMARY_CARD_NOTIFICATION,
} from '../../constants';
import { CLASSNAME_HIDDEN } from '@vfde-brix/ws10/styles';
import {
    getPromotionalSummaryCardInfo,
    togglePromotionalSummaryCardChildren,
} from '../promotionalSummaryCardHelpers';
import {
    DataVolumeUnit,
    Discount,
} from '@vfde-sails/glados-v2';
import { getGigakombiDiscountSocs } from '@vfde-sails/page-options';
const { sailsPageOptions } = require('@vfde-sails/page-options/fixtures');

jest.mock('@vfde-brix/ws10/styles', () => ({
    CLASSNAME_HIDDEN: 'ws10-hidden',
}));

jest.mock('@vfde-brix/ws10/option-picker', () => ({
    OPTION_PICKER_INPUT_CLASSNAME: 'ws10-option-picker__input',
}));
jest.mock('@vfde-sails/storage', () => ({
    getSessionStorageItemJson: jest.fn(),
}));
jest.mock('@vfde-brix/ws10/promotional-card', () => ({
    PROMOTIONAL_CARD_BASE_CLASSNAME: 'ws10-promotional-card',
}));
// Mock the functions that are called within togglePromotionalSummaryCardChildren
jest.mock('../promotionalSummaryCardHelpers', () => ({
    ...jest.requireActual('../promotionalSummaryCardHelpers'),
}));

const tariffDiscountFromApi: Discount = {
    'dataVolume': [
        {
            'value': -1,
            'displayLabel': 'GigaKombi-Vorteil: Unbegrenztes Datenvolumen',
            'discountId': '2246',
            'unit': DataVolumeUnit.GB,
        },
        {
            'value': 25,
            'displayLabel': 'AKTION: Jeden Monat 25 GB extra f&#252;r die gesamte Vertragslaufzeit',
            'discountId': '10040',
            'unit': DataVolumeUnit.GB,
        },
        {
            'value': 200,
            'displayLabel': 'AKTION: Dauerhaft 200 GB Datenvolumen geschenkt',
            'discountId': '10256',
            'unit': DataVolumeUnit.GB,
        },
    ],
    'monetary': [
        {
            'displayLabel': 'GigaKombi-Rabatt: Jeden Monat 10 € geschenkt',
            'gross': -10,
            'discountId': '177',
        },
        {
            'displayLabel': 'AKTION: Jeden Monat 25 GB extra f&#252;r die gesamte Vertragslaufzeit',
            'gross': 0,
            'discountId': '10040',
        },
        {
            'displayLabel': 'GigaKombi-Vorteil: Unbegrenztes Datenvolumen',
            'gross': 0,
            'discountId': '2246',
        },
        {
            'displayLabel': 'AKTION: Dauerhaft 200 GB Datenvolumen geschenkt',
            'gross': 0,
            'discountId': '10256',
        },
    ],
};
describe('Promotional summary card test cases', () => {
    const htmlMock = document.createElement('div');
    beforeEach(() => {
        (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => ({
            [SAILS_PARAM_CUSTOMER]: {
                isGigakombiEligible: true,
            },
            [SAILS_PARAM_SALESCHANNEL]: SALESCHANNEL_YOUNG,
        }));
    });
    describe('Promotional summary card domHelper', () => {
        const promotionalSummaryCard = document.createElement('div');
        const promotionalSummaryCardHeader = document.createElement('div');
        const promotionalSummaryCardHeaderYoung =
            document.createElement('div');
        const promotionalSummaryCardNotification =
            document.createElement('div');
        const promotionalSummaryCardContent = document.createElement('div');
        const promotionalSummaryCardDataVolume =
            document.createElement('div');

        beforeAll(() => {
            promotionalSummaryCard.id = PROMOTIONAL_SUMMARY_CARD_CONTAINER_ID;
            promotionalSummaryCardHeader.id =
                PROMOTIONAL_SUMMARY_CARD_HEADER_ICON_TEXT;
            promotionalSummaryCardHeaderYoung.id =
                PROMOTIONAL_SUMMARY_CARD_HEADER_YOUNG_ICON_TEXT;
            promotionalSummaryCardNotification.id =
                PROMOTIONAL_SUMMARY_CARD_NOTIFICATION;
            promotionalSummaryCardContent.id =
                PROMOTIONAL_SUMMARY_CARD_CONTENT;
            promotionalSummaryCardDataVolume.id =
                PROMOTIONAL_SUMMARY_CARD_DATA_VOLUME;
            promotionalSummaryCard.appendChild(promotionalSummaryCardHeader);
            promotionalSummaryCardHeader.appendChild(
                promotionalSummaryCardHeaderYoung,
            );
            promotionalSummaryCard.appendChild(
                promotionalSummaryCardNotification,
            );
            promotionalSummaryCard.appendChild(promotionalSummaryCardContent);
            promotionalSummaryCardContent.appendChild(
                promotionalSummaryCardDataVolume,
            );

            document.body.appendChild(promotionalSummaryCard);
            window[SAILS_PAGE_OPTIONS] = sailsPageOptions;
        });

        afterAll(() => {
            htmlMock.innerHTML = '';
            sessionStorage.removeItem(SAILS_VVL_STORAGE);
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(
                () => null,
            );
        });

        it('Should render the component in the default state', () => {
            const subscriptionId = RED_M_VIRTUAL_ID;
            const hasExtraGb = true;
            const gigakombiSocs = getGigakombiDiscountSocs(SALESCHANNEL_CONSUMER, undefined, GIGAKOMBI_IP_TV);
            togglePromotionalSummaryCardChildren(subscriptionId, hasExtraGb, tariffDiscountFromApi, gigakombiSocs);
            expect(
                document
                    .getElementById(
                        PROMOTIONAL_SUMMARY_CARD_HEADER_YOUNG_ICON_TEXT,
                    )!
                    .classList.contains(CLASSNAME_HIDDEN),
            ).toBeTruthy();
            expect(
                document
                    .getElementById(PROMOTIONAL_SUMMARY_CARD_CONTENT)!
                    .classList.contains(CLASSNAME_HIDDEN),
            ).toBeFalsy();
            expect(
                document
                    .getElementById(PROMOTIONAL_SUMMARY_CARD_DATA_VOLUME)!
                    .classList.contains(CLASSNAME_HIDDEN),
            ).toBeFalsy();

            expect(
                document
                    .getElementById(PROMOTIONAL_SUMMARY_CARD_NOTIFICATION)!
                    .classList.contains(CLASSNAME_HIDDEN),
            ).toBeTruthy();
        });

        it('should show the young header and notification when select the YOUNG_XS_VIRTUAL_ID subscriptionId', () => {
            const subscriptionId = YOUNG_XS_VIRTUAL_ID;
            const hasExtraGb = false;
            togglePromotionalSummaryCardChildren(subscriptionId, hasExtraGb);

            expect(
                document
                    .getElementById(
                        PROMOTIONAL_SUMMARY_CARD_HEADER_YOUNG_ICON_TEXT,
                    )!
                    .classList.contains(CLASSNAME_HIDDEN),
            ).toBeFalsy();
            expect(
                document
                    .getElementById(PROMOTIONAL_SUMMARY_CARD_CONTENT)!
                    .classList.contains(CLASSNAME_HIDDEN),
            ).toBeTruthy();
            expect(
                document
                    .getElementById(PROMOTIONAL_SUMMARY_CARD_DATA_VOLUME)!
                    .classList.contains(CLASSNAME_HIDDEN),
            ).toBeTruthy();
            expect(
                document
                    .getElementById(PROMOTIONAL_SUMMARY_CARD_NOTIFICATION)!
                    .classList.contains(CLASSNAME_HIDDEN),
            ).toBeFalsy();
        });

        it('should hide the data volume when select the YOUNG_XL_VIRTUAL_ID subscriptionId ', () => {
            const subscriptionId = YOUNG_XL_VIRTUAL_ID;
            const hasExtraGb = false;
            togglePromotionalSummaryCardChildren(subscriptionId, hasExtraGb);
            expect(
                document
                    .getElementById(PROMOTIONAL_SUMMARY_CARD_DATA_VOLUME)!
                    .classList.contains(CLASSNAME_HIDDEN),
            ).toBeTruthy();
        });
        it('should hide the data volume when hasExtraGb is false ', () => {
            const subscriptionId = YOUNG_M_VIRTUAL_ID;
            const hasExtraGb = false;
            togglePromotionalSummaryCardChildren(subscriptionId, hasExtraGb);
            expect(
                document
                    .getElementById(PROMOTIONAL_SUMMARY_CARD_DATA_VOLUME)!
                    .classList.contains(CLASSNAME_HIDDEN),
            ).toBeTruthy();
        });
        it('should hide the data volume when hasDataVolume is false ', () => {
            const subscriptionId = YOUNG_S_VIRTUAL_ID;
            const hasExtraGb = true;
            togglePromotionalSummaryCardChildren(subscriptionId, hasExtraGb);
            expect(
                document
                    .getElementById(PROMOTIONAL_SUMMARY_CARD_DATA_VOLUME)!
                    .classList.contains(CLASSNAME_HIDDEN),
            ).toBeTruthy();
        });
    });

    describe('get Promotional SummaryCard Info from the additional page option', () => {
        it('should override the offerPriceInfo parameter found in the additionalPageOption with the given parameter', () => {
            (window as any).additionalPageOptions = {
                promotionalSummaryCard: {
                    offerPriceInfo:
                        'Du sparst <strong>jeden Monat {{savedMoneyAmount}} € </strong>',
                },
            };
            const promotionalSummaryCardOffer = { offerPrice: 13 };
            const str = 'Du sparst <strong>jeden Monat 13 € </strong>';
            const modifiedString = getPromotionalSummaryCardInfo(
                promotionalSummaryCardOffer,
            );
            expect(modifiedString).toEqual(str);
        });
    });

});
