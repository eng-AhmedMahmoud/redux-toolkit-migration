/* eslint-disable no-use-before-define, jsdoc/require-jsdoc */

import {
    ADDITIONAL_PAGE_OPTIONS,
    RedplusTariff,
    SalesChannel,
} from '@vfde-sails/constants';

declare global {
    interface Window {
        [ADDITIONAL_PAGE_OPTIONS]: AdditionalPageOptions;
    }
}

export interface HighlightBadgeMap<HighlightBadgeOptions> {
    [x: string]: HighlightBadgeOptions;
}

export interface HighlightBadgeOptions {
    text: string;
    icon?: string;
    color?: string;
    tooltip?: {
        headline: string;
        text: string;
    };
}

export interface AdditionalPageOptions {
    headline: string;
    subline: string;
    deviceId: string;
    pageName: string;
    tariffOverview: {
        [key in SalesChannel]: string;
    };
    promos: {
        tradeIn: {
            suggestInputLabel?: string;
            suggestInputPlaceholder?: string;
            itemSummaryCardSubline: string;
            deviceNotFoundText: string;
            technicalErrorText: string;
        };
        tauschbonus?: {
            tauschbonusSubline: string;
            tauschbonusSublinePromoOverview: string;
        };
    };
    offerSummaryCard: {
        goToTariffOverviewButton: string;
        tariffSubline: string;
        stairwayLabel: string;
        connectionFeeLabel: string;
        noConnectionFee: string;
        contractRuntime: string;
        priceCondition: string;
        insuranceTitle: string;
        withAddons: string;
        unlimitedDataVolume: string;
        defaultBasketButtonText: string;
    };
    highlightBadges?: {
        [x: string]: {
            text: string;
        };
    };
    ecoLabel: {
        key: string;
        text: string;
        link: string;
    };
    hardwareOnly: {
        headline: string;
        highlightBadge?: HighlightBadgeOptions;
        offerSummaryCard: {
            priceCondition: string;
            tariffSubline: string;
            primaryButtonText: string;
            primaryButtonLink: string;
        };
    };
    gigakombi: {
        offerSummaryCard: {
            basketButtonText: string;
            gigakombiOverlay: string;
            loginOverlay: {
                GIGAKOMBI_XSELL_MOBILE: { // eslint-disable-line @typescript-eslint/naming-convention
                    urlCableCustomer: string;
                    urlDslCustomer: string;
                    urlUnityCustomer: string;
                    urlMobileCustomer: string;
                    urlNoneCustomer: string;
                    urlError: string;
                };
                formErrors: {
                    minLengthUsername: string;
                    minLengthPassword: string;
                    required: string;
                };
                formHelperTexts: {
                    username: string;
                    password: string;
                };
            };
        };
        highlightBadges: HighlightBadgeMap<HighlightBadgeOptions>;
    };
    familyFriends: {
        highlightBadges: HighlightBadgeMap<HighlightBadgeOptions>;
        offerSummaryCard: {
            primaryButtonText: string;
            primaryButtonLink: string;
        };
        errorPage: string;
    };
    soho: {
        subline: string;
        highlightBadges: HighlightBadgeMap<HighlightBadgeOptions>;
    };
    redplus: {
        headline: string;
        defaultSubscriptionId?: RedplusTariff;
        highlightBadges: HighlightBadgeMap<HighlightBadgeOptions>;
        offerSummaryCard: {
            primaryButtonText: string;
            primaryButtonLink: string;
        };
    };
    technicalDetails: {
        icons: {
            [id: string]: string;
        },
        headline: string;
    };
    vlux: {
        attributeIds: {
            deliveryScope: string;
        },
        attributeGroupIds: {
            characteristics: string;
            top: string;
            display: string;
            camera: string;
            memory: string;
            sim: string;
            connectivity: string;
            entertainment: string;
            handling: string;
            organizer: string;
        },
        attributeValues: {
            yes: string,
            no: string,
        },
    },
}
