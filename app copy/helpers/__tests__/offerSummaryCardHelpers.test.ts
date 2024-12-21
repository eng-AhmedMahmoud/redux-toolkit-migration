import {
    ADDITIONAL_PAGE_OPTIONS,
    RED_XS_VIRTUAL_ID,
} from '@vfde-sails/constants';
import {
    createTooltipId,
    getHeadline,
    getHighlightBadgeFromAdditionalPageOptions,
    getLegalText,
    getStairwayText,
    getSubline,
} from '../offerSummaryCardHelpers';
import { StateProps } from '../../container/Tariff/interface';
import {
    DataVolume,
    OfferType,
    PriceType,
    TariffOffer,
    TariffWithHardwareOffer,
} from '@vfde-sails/glados-v2';

jest.mock('@vfde-brix/ws10/core', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Price: {
        fromString: jest.fn().mockImplementation(input => input),
    },
}));

jest.mock('@vfde-brix/ws10/styles', () => ({
    /* eslint-disable @typescript-eslint/naming-convention, camelcase */
    CLASSNAME_HIDDEN: 'foo',
    /* eslint-enable @typescript-eslint/naming-convention, camelcase */
}));

jest.mock('@vfde-brix/ws10/option-picker', () => ({
    /* eslint-disable @typescript-eslint/naming-convention, camelcase */
    OPTION_PICKER_INPUT_CLASSNAME: 'foo',
    /* eslint-enable @typescript-eslint/naming-convention, camelcase */
}));

describe('offerSummaryCardHelper', () => {

    beforeEach(() => {
        (window as any)[ADDITIONAL_PAGE_OPTIONS] = {
            offerSummaryCard: {
                highlightBadges: {
                    133: {
                        text: '<p>Anschlusspreis und Versand geschenkt GM XS</p>',
                        tooltip: {
                            headline: 'Anschlusspreis und Versand geschenkt',
                            text: 'Tooltip-Text',
                        },
                        color: 'green',
                    },
                },
                stairwayTextPattern: 'Ab dem {{month}}. Monat <b>{{tariffPrice}} €</b>.',
                legalTextPattern: 'Dazu einmal {{oneTimeFee}} € Anschlusspreis.',
                noOneTimeFeeText: 'Kein Anschlusspreis. Keine Versandkosten.',
                tariffInfoPattern: '{{name}} mit {{amount}}',
                deviceInfoPattern: '{{deviceName}}',
            },
        };
    });

    describe('getHighlightBadgeFromAdditionalPageOptions', () => {

        it('should return undefined', () => {
            expect(getHighlightBadgeFromAdditionalPageOptions('9999')).toEqual(undefined);
        });

        it('should get the highlight badge matching the subscription id', () => {
            const { highlightBadges } = (window as any).additionalPageOptions.offerSummaryCard;

            expect(getHighlightBadgeFromAdditionalPageOptions(RED_XS_VIRTUAL_ID)).toEqual(highlightBadges[RED_XS_VIRTUAL_ID]);
        });
    });

    describe('getTariffInfo', () => {

        it('should return null', () => {
            const expected = getSubline({
                offer: null,
                dataVolume: null,
            } as StateProps);

            expect(expected).toBeNull();
        });

        it('With tariff name and GB value', () => {
            const expected = getSubline({
                offer: {
                    tariffName: 'GigaMobil S',
                } as Partial<TariffOffer>,
                dataVolume: {
                    runTimeEnd: 24,
                    runTimeStart: 1,
                    unit: 'GB',
                    unlimited: false,
                    value: 24,
                } as Partial<DataVolume>,
            } as StateProps);

            expect(expected).toStrictEqual(['GigaMobil S mit 24 GB']);
        });

        it('With tariff name and unlimited GBs', () => {
            const expected = getSubline({
                offer: {
                    tariffName: 'GigaMobil S',
                } as Partial<TariffOffer>,
                dataVolume: {
                    runTimeEnd: 24,
                    runTimeStart: 1,
                    unit: 'GB',
                    unlimited: true,
                    value: 24,
                } as Partial<DataVolume>,
            } as StateProps);

            expect(expected).toStrictEqual(['GigaMobil S mit unbegrenzten GB']);
        });
    });

    describe('getHeadline', () => {
        const deviceName = 'iPhone 15';

        it('should get device info', () => {
            expect(getHeadline(deviceName)).toEqual(deviceName);
        });
    });

    describe('getLegalText', () => {

        it('should return undefined', () => {
            const expected = getLegalText({
                offer: null,
                dataVolume: null,
            } as StateProps);

            expect(expected).toBeNull();
        });

        it('Should return no one time fee text as legal text', () => {
            const expected = getLegalText({
                offer: {
                    prices: {
                        [OfferType.Composition]: {
                            [OfferType.HardwareOnly]: {
                                [PriceType.Onetime]: {
                                    withoutDiscounts: {
                                        gross: 39.99,
                                    },
                                },
                            },
                            [OfferType.SimOnly]: {},
                        },
                    },
                } as Partial<TariffWithHardwareOffer>,
            } as StateProps);

            expect(expected).toEqual(['Kein Anschlusspreis. Keine Versandkosten.']);
        });

        it('Should return legal text with one time fee', () => {
            const expected = getLegalText({
                offer: {
                    prices: {
                        [OfferType.Composition]: {
                            [OfferType.SimOnly]: {
                                [PriceType.Onetime]: {
                                    withoutDiscounts: {
                                        gross: 29.99,
                                    },
                                },
                            },
                        },
                    },
                } as Partial<TariffWithHardwareOffer>,
            } as StateProps);

            expect(expected).toEqual(['Dazu einmal 29,99 € Anschlusspreis.']);
        });
    });

    describe('getStairwayText', () => {
        it('hides stairway when there is none', () => {
            const stateFixture = {
                offer: null,
                hasStairway: false,
                endPriceToPay: null,
            } as StateProps;

            expect(getStairwayText({ ...stateFixture, hasStairway: false } as StateProps)).toBeNull();
        });

        it('shows stairway text if there is a stairway in offer', () => {
            const txt = getStairwayText({
                hasStairway: true,
                priceToPay: {
                    gross: 44.99,
                    recurrenceEnd: 6,
                },
                offer: {
                    tariffName: 'GigaMobil S',
                },
            } as StateProps);

            expect(txt!.includes('7')).toBeTruthy();
            expect.assertions(1);
        });
    });

    describe('createTooltipId', () => {

        it('should generate a valid tooltip ID', () => {
            const expected = createTooltipId({
                offer: {
                    virtualItemId: RED_XS_VIRTUAL_ID,
                } as Partial<TariffOffer>,
            } as StateProps);

            expect(expected).toEqual(`highlight-badge-tooltip-${RED_XS_VIRTUAL_ID}`);
        });
    });
});
