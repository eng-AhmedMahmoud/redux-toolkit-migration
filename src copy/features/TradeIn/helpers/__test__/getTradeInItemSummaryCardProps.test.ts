import {
    ADDITIONAL_PAGE_OPTIONS,
    SAILS_PAGE_OPTIONS,
} from '@vfde-sails/constants';
import getTradeInItemSummaryCardProps from '../getTradeInItemSummaryCardProps';
import { AdditionalPageOptions } from '../../../App/interfaces/additionalPageOptions';
import tradeInSlice from '../../slice';
import appSlice from '../../../App/slice';
import tariffSlice from '../../../Tariff/slice';
import { RootState } from 'src/app/store';
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
    const mockedProps = {
        image: {
            imgSrcDesktop: '',
            imgSrcMobile: '',
            stdImgAlt: '',
        },
        optIconButton: true,
        stdHeadline: 'Samsung Galaxy S24',
        stdSubline: 'F&uuml;r Dein Smartphone: <strong>Einmal bis zu . </strong>Je nach Zustand.',
        containerCopytext: 'Tauschbonus: <b>20 € Rabatt pro Monat.</b> 12 Monate lang. Gilt ab dem Verkauf Deines alten Handys.',
        business: {},
    };

    const stateWithSelectedTradeInDevice: Partial<RootState> = {
        [appSlice.name]: {
            isTauschbonus: true,
            deviceId: '87',
        },
        [tradeInSlice.name]: {
            isLoading: false,
            devices: [
                {
                    id: '87',
                    name: 'Samsung Galaxy S24',
                    maxPrice: 0,
                    formattedPrice: '',
                    imgSrc: '',
                },
            ],
            hasError: false,
            isTradeInSelected: true,
            suggestInputValue: 'mock input',
            selectedTradeInDeviceId: '87',
            isDeviceNotFound: false,
        },
    }as RootState;
    const stateWithoutSelectedTradeInDevice: Partial<RootState> = {
        [tradeInSlice.name]: {
            isLoading: false,
            devices: [
                {
                    id: '85',
                    name: 'Samsung Galaxy S24',
                    maxPrice: 0,
                    formattedPrice: '',
                    imgSrc: '',
                },
            ],
            hasError: false,
            isTradeInSelected: true,
            suggestInputValue: 'mock input',
            selectedTradeInDeviceId: null,
            isDeviceNotFound: false,
        },
        [appSlice.name]: {
            isTauschbonus: true,
        },
        [tariffSlice.name]: {
            subscriptionId: null,
        },
    }as unknown as RootState;

    it('should return expected props for normal scenario', () => {
        const result = getTradeInItemSummaryCardProps(stateWithSelectedTradeInDevice as RootState);

        expect(result).toEqual([{
            ...mockedProps,
        }]);
    });

    it('should handle no selectedTradeInDevice', () => {
        const result = getTradeInItemSummaryCardProps(stateWithoutSelectedTradeInDevice as RootState)[0];

        expect(result.stdHeadline).toBe('');
        expect(result.image?.imgSrcDesktop).toBe(undefined);
        expect(result.image?.imgSrcMobile).toBe(undefined);
    });

});
