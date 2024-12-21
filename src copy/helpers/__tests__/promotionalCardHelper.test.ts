import { IFlagBadgeProperties } from '@vfde-brix/ws10/flag-badge';
import { IFormSelectionControlProperties } from '@vfde-brix/ws10/form-selection-control';
import {
    filterPromotionalCards,
    getGigaKombiPromotionalCard,
    getPromotionalCardProps,
    getPromotionalCardsFromAdditionalPagesOptions,
    mountPromotionalCardList,
    renderCard,
} from '../promotionalCardHelper';
import {
    PROMOTIONAL_CARD_CHECKBOX_GROUP_NAME,
    PROMOTIONAL_CARD_CONTAINER_ID,
    PROMOTIONAL_CARD_OVERLAY_CONTAINER_ID_PREFIX,
} from '../../../app/container/Tariff/constants';
import { PromotionalCardProps } from '../../../app/container/Tariff/interface';
import { mountPromotionalCardById } from '../../components/PromotionalCard';
import { IPromotionalCardProperties } from '@vfde-brix/ws10/promotional-card';
import {
    initializeOverlayOpenEvent,
    mountOverlay,
} from '../../components/Overlay';
import {
    GIGAKOMBI_IP,
    SAILS_PARAM_CUSTOMER,
    SALESCHANNEL_CONSUMER,
} from '@vfde-sails/constants';
import { getSessionStorageItemJson } from '@vfde-sails/storage';
import {
    DataVolumeUnit,
    TariffWithHardwareOffer,
} from '@vfde-sails/glados-v2';
import { getGigakombiDiscountSocs } from '@vfde-sails/page-options';

jest.mock('@vfde-brix/ws10/core', () => ({
    NO_PATTERN_BUSINESS_LOGIC: {},
}));

jest.mock('@vfde-brix/ws10/promotional-card', () => ({
    PROMOTIONAL_CARD_BASE_CLASSNAME: 'ws10-promotional-card',
    createPromotionalCard: jest.fn(),

}));

jest.mock('@vfde-brix/ws10/overlay', () => ({
}));

jest.mock('../../components/PromotionalCard', () => ({
    mountPromotionalCardById: jest.fn(),
}));

jest.mock('../../components/Overlay', () => ({
    mountOverlay: jest.fn(),
    initializeOverlayOpenEvent: jest.fn(),
}));

jest.mock('@vfde-sails/storage', () => ({
    getSessionStorageItemJson: jest.fn(),
}));

jest.mock('@vfde-sails/page-options', () => ({
    getTauschbonusAmount: jest.fn(),
    getGigakombiDiscountSocs: jest.fn(),
    hasExtraGb: jest.fn(),
}));

describe('getPromotionalCardProps', () => {
    const cardFromAdditionalPageOptions: PromotionalCardProps = {
        stdId: 'foo',
        stdLabel: 'GigaMobile Young M Promo',
        stdIcon: 'unlocked-rewards',
        txtSublabel: 'Lorem ipsum dolor sit amet consectetur.',
    };

    it('should get promotional card props', () => {
        expect(getPromotionalCardProps(cardFromAdditionalPageOptions).business).toBeTruthy;
    });

    it('should get promotional card props with flag badge', () => {
        cardFromAdditionalPageOptions.flagBadge = {
            stdLabel: 'Flag Badge',
            optColor: 'green',
        };
        const expected = getPromotionalCardProps(cardFromAdditionalPageOptions).containerFlagBadge as IFlagBadgeProperties;

        expect(expected).toBeTruthy;
        expect(expected.optColor).toEqual('green');
    });

    it('should get promotional card props with checkbox', () => {
        cardFromAdditionalPageOptions.checkbox = {
            txtLabelText: '<p>Lorem ipsum dolor sit</p>',
            stdValue: 'checkbox-value',
            spacing: '0',
            stdConfirmationText: 'Promotion activated',
        };
        const expected = getPromotionalCardProps(cardFromAdditionalPageOptions).containerFormSelectionControl as IFormSelectionControlProperties;

        expect(expected).toBeTruthy;
        expect(expected.stdGroupName).toEqual(`${PROMOTIONAL_CARD_CHECKBOX_GROUP_NAME}foo`);
    });
});

describe('Hide promotions from CMS based on the visibility of other promotions', () => {

    it('should return all cards if there is no card to hide', () => {
        const promotionalCards = [
            { stdId: 'id1', shouldBeHiddenWith: ['id8'] },
            { stdId: 'id2', shouldBeHiddenWith: [] },
            { stdId: 'id3', shouldBeHiddenWith: ['id4'] },
        ] as PromotionalCardProps[];

        expect(filterPromotionalCards(promotionalCards)).toEqual(promotionalCards);
    });

    it('should filter cards if there is stdId should be hidden', () => {
        const promotionalCards = [
            { stdId: 'id1', shouldBeHiddenWith: ['id8'] },
            { stdId: 'id2', shouldBeHiddenWith: [] },
            { stdId: 'id3', shouldBeHiddenWith: ['id1'] },
        ] as PromotionalCardProps[];

        const expectedCards = [
            { stdId: 'id1', shouldBeHiddenWith: ['id8'] },
            { stdId: 'id2', shouldBeHiddenWith: [] },
        ];
        expect(filterPromotionalCards(promotionalCards)).toEqual(
            expectedCards,
        );
    });
    it('should return all cards if shouldBeHiddenWith array is empty in all cards', () => {
        const promotionalCards = [
            { stdId: 'id1', shouldBeHiddenWith: [] },
            { stdId: 'id2', shouldBeHiddenWith: [] },
            { stdId: 'id3', shouldBeHiddenWith: [] },
        ] as unknown[] as PromotionalCardProps[];

        expect(filterPromotionalCards(promotionalCards)).toEqual(
            promotionalCards,
        );
    });

    it('should filter if there are cards with no shouldHiddenWith array', () => {
        const promotionalCards = [
            { stdId: 'id1' },
            { stdId: 'id2', shouldBeHiddenWith: ['id3'] },
            { stdId: 'id3', shouldBeHiddenWith: [] },
        ] as PromotionalCardProps[];
        const expectedCards = [
            { stdId: 'id1' },
            { stdId: 'id3', shouldBeHiddenWith: [] },
        ];

        expect(filterPromotionalCards(promotionalCards)).toEqual(
            expectedCards,
        );
    });
});

describe('renderCard', () => {
    let wrapper: HTMLElement;

    beforeEach(() => {
        // Set up the wrapper element before each test
        wrapper = document.createElement('div');
        document.body.appendChild(wrapper);

    });

    const mockCardProps: PromotionalCardProps = {
        stdId: '123',
        stdLabel: 'GigaMobile Young M Promo',
        stdIcon: 'unlocked-rewards',
        txtSublabel: 'Lorem ipsum dolor sit amet consectetur.',
    };

    test('creates a new container and mounts the promotional card', () => {
        const overlayLink1 = document.createElement('a');
        overlayLink1.setAttribute('data-action', 'overlay');

        // Append links to the container
        wrapper.appendChild(overlayLink1);
        renderCard(mockCardProps.stdId, wrapper, mockCardProps);
        const iPromotionalCardProps: IPromotionalCardProperties = getPromotionalCardProps(mockCardProps);
        const containerId = `${PROMOTIONAL_CARD_CONTAINER_ID}${mockCardProps.stdId}`;
        expect(mountPromotionalCardById).toHaveBeenCalledWith(containerId, iPromotionalCardProps); // Check if mounted
        const overlay = mountOverlay(`${PROMOTIONAL_CARD_OVERLAY_CONTAINER_ID_PREFIX}${mockCardProps.stdId}`);
        expect(initializeOverlayOpenEvent).toHaveBeenCalledWith(
            overlay, // The overlay element
            overlayLink1,
        );
    });

});

describe('mountPromotionalCardList', () => {
    const mockPromotionalCardFromCms = {
        promotionalCard: {
            '54': {
                'device': [
                    {
                        'flagBadge': {
                            'stdLabel': '<strong>Nur bis 1. Mai</strong>',
                            'optColor': 'green',
                        },
                        'stdId': 'samsung-a55-buds',
                        'stdLabel': 'Kostenlos dazu: Airpods Pro in Graphite<sup>4</sup>',
                        'stdIcon': 'accessories',
                        'txtSublabel': '<p>Mehr Infos</p>',
                    },
                ],

                'consumer': [
                    {
                        'flagBadge': {
                            'stdLabel': '<strong>Nur bis 1. Mai</strong>',
                            'optColor': 'green',
                        },
                        'stdId': 'iphone-15-pro-max-consumer',
                        'stdLabel': 'Dein neues iPhone 15 Pro Max ab 1&nbsp;&euro;. Passt? Deal!',
                        'stdIcon': 'auto-topup',
                        'txtSublabel': '<p>Du bekommst das iPhone 15 Pro Max für nur einmal 1&nbsp;&euro;.<sup>4</sup></p>',
                    },
                ],
            },
            '133': [
                {
                    'stdId': 'gigamobile-xs-promo',
                    'stdLabel': 'Hol Dir doppeltes Datenvolumen',
                    'stdIcon': 'idea',
                    'txtSublabel': 'Ab dem GigaMobil S verdoppeln wir Dir Dein Datenvolumen.<sup>4</sup>',
                    'flagBadge': {
                        'stdLabel': 'Info',
                        'optColor': 'yellow',
                    },
                },
            ],
            'gigaKombiOffer': {
                'stdId': 'gigaKombi-{{gkCase}}',
                'stdIcon': 'unlocked-rewards',
                'stdLabel': 'GigaKombi-Vorteil',
                'txtSublabelOffer': '{{offerPrice}} &euro; Rabatt pro Monat und {{extraGB}} GB Extra-Datenvolumen.<sup>4</sup>',
                'txtSublabelUnlimitedOffer': '{{offerPrice}} &euro; Rabatt pro Monat und unbegrenztes Datenvolumen.',
                'txtSublabelPriceOffer': '{{offerPrice}} &euro; Rabatt pro Monat',
                'shouldBeHiddenWith': {
                    'ip': [
                        'gigamobile-m-promo',
                        'gigamobile-l-promo',
                    ],
                    'iptv': [
                        'gigamobile-m-promo',
                        'gigamobile-l-promo',
                    ],
                    'tv': [],
                    'br5': [],
                },
            },
            'tradeInPromotionalCard': {
                'stdId': 'tradeIn-tauschbonus',
                'stdIcon': 'tick',
                'stdLabel': 'Du hast die Inzahlungnahme aktiviert',
                'txtSublabel': 'Für Dein altes Smartphone bekommst Du eine <strong>einmalige Gutschrift.</strong>',
                'txtSublabelTauschbonus': 'Für Dein altes Smartphone bekommst Du eine <strong>einmalige Gutschrift.</strong> Und dazu den Tauschbonus: <strong>{{tauschbonusAmount}} &euro; Rabatt pro Monat.</strong> 12 Monate lang. Gilt ab dem Verkauf Deines alten Handys.',
            },
        },
    };

    beforeEach(() => {

        (window as any).additionalPageOptions = mockPromotionalCardFromCms;
        (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => ({
            [SAILS_PARAM_CUSTOMER]: {
                isGigakombiEligible: true,
                gigakombiType: GIGAKOMBI_IP,
            },
        }));
        (window as any).vf = {
            footnotes: {
                init: jest.fn(),
            },
        };

    });
    test('creates a new container and mounts the promotional card', () => {
        const deviceId = '54';
        const salesChannel = SALESCHANNEL_CONSUMER;
        const subscriptionId = '133';
        const offer = {
            discount: {
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
            },
        } as TariffWithHardwareOffer;
        const isTauschbonus = true;
        const isTradeIn = true;
        (getGigakombiDiscountSocs as jest.Mock).mockReturnValue(['177']);
        mountPromotionalCardList(
            deviceId,
            salesChannel,
            subscriptionId,
            offer,
            isTauschbonus,
            isTradeIn,
        );
        const promotionalCards = getPromotionalCardsFromAdditionalPagesOptions(deviceId!, salesChannel!, subscriptionId!);
        const gigaKombiCard = getGigaKombiPromotionalCard(offer, salesChannel!);
        const mergedCards = promotionalCards;

        if (gigaKombiCard) {
            mergedCards.unshift(gigaKombiCard);
        }

        mergedCards.forEach((item: PromotionalCardProps) => {
            const iPromotionalCardProps: IPromotionalCardProperties = getPromotionalCardProps(item);
            const containerId = `${PROMOTIONAL_CARD_CONTAINER_ID}${item.stdId}`;
            expect(mountPromotionalCardById).toHaveBeenCalledWith(containerId, iPromotionalCardProps); // Check if mounted
        });
        expect((window as any).vf.footnotes.init).toHaveBeenCalled(); // Check footnotes initialization

    });
});
