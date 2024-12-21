import {
    ADDITIONAL_PAGE_OPTIONS,
    SAILS_PAGE_OPTIONS,
} from '@vfde-sails/constants';
import { AdditionalPageOptions } from 'Container/App/interfaces/additionalPageOptions';
import { StateProps } from '../../../TradeIn/interfaces/state';
import getTradeInItemSummaryCardProps from '../getTradeInItemSummaryCardProps';
const { sailsPageOptions } = require('@vfde-sails/page-options/fixtures');

jest.mock('@vfde-brix/ws10/core', () => ({
    NO_PATTERN_BUSINESS_LOGIC: {},
}));

beforeEach(() => {
    window[ADDITIONAL_PAGE_OPTIONS] = {
        promos: {
            'tradeIn': {
                'suggestInputLabel': 'Tipp hier Dein Modell ein',
                'suggestInputPlaceholder': 'Tipp hier Dein Smartphone-Modell ein',
                'deviceNotFoundText': 'Wir konnten das Modell leider nicht finden.',
                'technicalErrorText': 'Technischer Fehler: Bitte versuch es später nochmal!',
                'itemSummaryCardSubline': 'F&uuml;r Dein Smartphone: <strong>Einmal bis zu {{ maxPrice }}. </strong>Je nach Zustand.',
            },
            'tauschbonus': {
                'tauschbonusSubline': 'Tauschbonus: <b>{{ tauschbonusValue }} € Rabatt pro Monat.</b> 12 Monate lang. Gilt ab dem Verkauf Deines alten Handys.',
            },
        },
    } as AdditionalPageOptions;
});

beforeEach(() => {
    window[SAILS_PAGE_OPTIONS] = {
        ...sailsPageOptions,
    };
});

afterAll(() => {
    window[ADDITIONAL_PAGE_OPTIONS] = {} as AdditionalPageOptions;
});

describe('getTradeInItemSummaryCardProps', () => {
    // Mocked Props object
    const mockedProps = {
        image: {
            imgSrcDesktop: '',
            imgSrcMobile: '',
            stdImgAlt: '',
        },
        optIconButton: true,
        stdHeadline: 'iPhone 15 Pro Max',
        stdSubline: 'F&uuml;r Dein Smartphone: <strong>Einmal bis zu . </strong>Je nach Zustand.',
        containerCopytext: 'Tauschbonus: <b>10 € Rabatt pro Monat.</b> 12 Monate lang. Gilt ab dem Verkauf Deines alten Handys.',
        business: {},
    };

    // Mocked StateProps with selected TradeIn device
    const statePropsWithSelectedTradeInDevice: StateProps = {
        isLoading: false,
        hasError: false,
        devices: [
            // Example device data
            {
                id: '85',
                name: 'Samsung Galaxy S24',
                maxPrice: 0,
                formattedPrice: '',
                imgSrc: '',
            },
            // ... other devices
        ],
        isTradeInSelected: true,
        suggestInputValue: 'iPhone',
        selectedTradeInDevice: {
            id: '54',
            name: 'iPhone 15 Pro Max',
            maxPrice: 0,
            formattedPrice: '',
            imgSrc: '',
        },
        isDeviceNotFound: false,
        deviceId: '85',
        offer: null,
        isTauschbonus: true,
        isTradeIn: true,
        salesChannel: null,
        isTauschbonusEligible: true,
        subscriptionId: null,
    };

    // Mocked StateProps without selected TradeIn device
    const statePropsWithoutSelectedTradeInDevice: StateProps = {
        isLoading: false,
        hasError: false,
        devices: [
            // Example device data
            {
                id: '85',
                name: 'Samsung Galaxy S24',
                maxPrice: 0,
                formattedPrice: '',
                imgSrc: '',
            },
            // ... other devices
        ],
        isTradeInSelected: true,
        suggestInputValue: 'iPhone',
        selectedTradeInDevice: null,
        isDeviceNotFound: false,
        deviceId: '85',
        offer: null,
        isTauschbonus: false,
        isTradeIn: false,
        salesChannel: null,
        isTauschbonusEligible: false,
        subscriptionId: null,
    };

    it('should return expected props for normal scenario', () => {
        const result = getTradeInItemSummaryCardProps(statePropsWithSelectedTradeInDevice);

        expect(result).toEqual([{
            ...mockedProps,
        }]);
    });

    it('should handle no selectedTradeInDevice', () => {
        const result = getTradeInItemSummaryCardProps(statePropsWithoutSelectedTradeInDevice)[0];

        expect(result.stdHeadline).toBe('');
        expect(result.image?.imgSrcDesktop).toBe(undefined);
        expect(result.image?.imgSrcMobile).toBe(undefined);
    });

});
