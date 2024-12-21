import {
    toggleElementById,
    toggleTariffOptionPickers,
    toggleTariffOverlayButtonLink,
} from '../domHelper';
import {
    GIGAKOMBI_CONSUMER_BUTTON_LINK,
    GIGAKOMBI_YOUNG_BUTTON_LINK,
    PORTFOLIO_SWITCH_CONTAINER_ID,
} from '../../container/App/constants';
import { CLASSNAME_HIDDEN } from '@vfde-brix/ws10/styles';
import {
    GIGAMOBIL_TARIFF_OPTION_PICKER_CONTAINER_ID,
    GIGAMOBIL_YOUNG_TARIFF_OPTION_PICKER_CONTAINER_ID,
} from '../../container/Tariff/constants';
import {
    SALESCHANNEL_CONSUMER,
    SALESCHANNEL_YOUNG,
} from '@vfde-sails/constants';

jest.mock('@vfde-brix/ws10/styles', () => ({
    CLASSNAME_HIDDEN: 'ws10-hidden',
}));

jest.mock('@vfde-brix/ws10/option-picker', () => ({
    OPTION_PICKER_INPUT_CLASSNAME: 'ws10-option-picker__input',
}));

jest.mock('@vfde-brix/ws10/promotional-card', () => ({
    PROMOTIONAL_CARD_BASE_CLASSNAME: 'ws10-promotional-card',
}));

describe('Tariff domHelper', () => {
    const htmlMock = document.createElement('div');

    describe('toggleElementById', () => {
        beforeAll(() => {
            htmlMock.id = PORTFOLIO_SWITCH_CONTAINER_ID;
            document.body.appendChild(htmlMock);
        });

        afterAll(() => {
            htmlMock.innerHTML = '';
        });

        it('should hide horizontal list', () => {
            toggleElementById(PORTFOLIO_SWITCH_CONTAINER_ID, true);
            expect(document.getElementById(PORTFOLIO_SWITCH_CONTAINER_ID)!.classList.contains(CLASSNAME_HIDDEN)).toBeTruthy;
        });
    });

    describe('toggleTariffOptionPickers', () => {
        const GmOptionPicker = document.createElement('div');
        const GmYoungOptionPicker = document.createElement('div');
        beforeAll(() => {
            GmOptionPicker.id = GIGAMOBIL_TARIFF_OPTION_PICKER_CONTAINER_ID;
            GmYoungOptionPicker.id = GIGAMOBIL_YOUNG_TARIFF_OPTION_PICKER_CONTAINER_ID;
            document.body.appendChild(GmOptionPicker);
            document.body.appendChild(GmYoungOptionPicker);
        });

        afterAll(() => {
            htmlMock.innerHTML = '';
        });

        it('should show Gigamobil Option Picker and hide Gigamobil Young Option Picker', () => {
            toggleTariffOptionPickers(SALESCHANNEL_CONSUMER);
            expect(document.getElementById(GIGAMOBIL_TARIFF_OPTION_PICKER_CONTAINER_ID)!.classList.contains(CLASSNAME_HIDDEN)).toBeFalsy;
            expect(document.getElementById(GIGAMOBIL_YOUNG_TARIFF_OPTION_PICKER_CONTAINER_ID)!.classList.contains(CLASSNAME_HIDDEN)).toBeTruthy;
        });

        it('should show Gigamobil Young Option Picker Young and hide Gigamobil Option Picker', () => {
            toggleTariffOptionPickers(SALESCHANNEL_YOUNG);
            expect(document.getElementById(GIGAMOBIL_TARIFF_OPTION_PICKER_CONTAINER_ID)!.classList.contains(CLASSNAME_HIDDEN)).toBeFalsy;
            expect(document.getElementById(GIGAMOBIL_YOUNG_TARIFF_OPTION_PICKER_CONTAINER_ID)!.classList.contains(CLASSNAME_HIDDEN)).toBeTruthy;
        });
    });

    describe('toggleTariffOverlayButtonLink', () => {
        const consumerTariffOverlayButtonLink = document.createElement('div');
        const youngTariffOverlayButtonLink = document.createElement('div');
        beforeAll(() => {
            youngTariffOverlayButtonLink.id = GIGAKOMBI_CONSUMER_BUTTON_LINK;
            consumerTariffOverlayButtonLink.id = GIGAKOMBI_YOUNG_BUTTON_LINK;
            document.body.appendChild(youngTariffOverlayButtonLink);
            document.body.appendChild(consumerTariffOverlayButtonLink);
        });

        afterAll(() => {
            htmlMock.innerHTML = '';
        });

        it('should show consumerTariffOverlayButtonLink and hide youngTariffOverlayButtonLink', () => {
            toggleTariffOverlayButtonLink(SALESCHANNEL_YOUNG);
            expect(document.getElementById(GIGAKOMBI_CONSUMER_BUTTON_LINK)!.classList.contains(CLASSNAME_HIDDEN)).toBeFalsy;
            expect(document.getElementById(GIGAKOMBI_YOUNG_BUTTON_LINK)!.classList.contains(CLASSNAME_HIDDEN)).toBeTruthy;
        });

        it('should show youngTariffOverlayButtonLink and hide consumerTariffOverlayButtonLink', () => {
            toggleTariffOverlayButtonLink(SALESCHANNEL_CONSUMER);
            expect(document.getElementById(GIGAKOMBI_YOUNG_BUTTON_LINK)!.classList.contains(CLASSNAME_HIDDEN)).toBeFalsy;
            expect(document.getElementById(GIGAKOMBI_CONSUMER_BUTTON_LINK)!.classList.contains(CLASSNAME_HIDDEN)).toBeTruthy;
        });
    });
});
