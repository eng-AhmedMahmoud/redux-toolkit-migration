import {
    ADDITIONAL_PAGE_OPTIONS,
    GigakombiType,
    SalesChannel,
} from '@vfde-sails/constants';

/**
 * AdditionalPageOptions Interface
 */
export interface AdditionalPageOptions {
    /* eslint-disable jsdoc/require-jsdoc */
    pageName: string;
    mTanPageUrl: string;
    dopPageUrl: string;
    /* eslint-enable jsdoc/require-jsdoc */
    /* eslint-disable jsdoc/require-jsdoc */
    pibs: {
        [key: number]: string;
    },
    /* eslint-enable jsdoc/require-jsdoc */
    /**
     * TradeIn
     */
    promos:{
        tradeIn?:{
                suggestInputLabel: string,
                suggestInputPlaceholder: string,
                deviceNotFoundText: string,
                technicalErrorText: string,
                itemSummaryCardSubline: string,
        },
        tauschbonus?: {
            tauschbonusSubline: string,
        },
    },
    /* eslint-disable jsdoc/require-jsdoc */
    optionPicker: {
        colorTitle: string;
        capacityTitle: string;
        defaultSubscriptionIds: {
            gigaMobil: string;
            gigaMobilYoung: string;
        },
        /**
         * tariff info
         */
        tariffInfo: string;
        /**
         * unlimited tariff option
         */
        unlimitedTariffInfo: string;
        /**
         * subscription ids
         */
        subscriptionIds: { [key in SalesChannel]: number[]; } & { default: { [key in SalesChannel]: number; } };
    },
        promotionalSummaryCard: {
            offerPriceInfo: string;
        };
    /* eslint-enable jsdoc/require-jsdoc */
    /* eslint-disable jsdoc/require-jsdoc */
    offerSummaryCard: {
        /* eslint-disable jsdoc/require-jsdoc */
        extrasButtonText: string,
        extrasButtonUrl: string,
        basketButtonText: string,
        stairwayTextPattern: string,
        legalTextPattern: string,
        noOneTimeFeeText: string,
        tariffInfoPattern: string,
        deviceInfoPattern: string,
        familyCardLink: string,
        highlightBadges: {
            /* eslint-disable jsdoc/require-jsdoc */
            [key: number]: {
                text: string,
                tooltip?: {
                    headline?: string,
                    text: string,
                },
                color: string,
                icon?: string
            }
            /* eslint-enable jsdoc/require-jsdoc */
        },
        simOnlyFooterLink: string,
        /* eslint-enable jsdoc/require-jsdoc */
    },
    /* eslint-enable jsdoc/require-jsdoc */
    /* eslint-disable jsdoc/require-jsdoc */
    technicalDetails: {
        icons: {
            [id: string]: string;
        },
        headline: string;
    },
    /* eslint-enable jsdoc/require-jsdoc */
    /* eslint-disable jsdoc/require-jsdoc */
    ecoLabel: {
        key: string;
        text: string;
        link: string;
    },
    /* eslint-enable jsdoc/require-jsdoc */
    /* eslint-disable jsdoc/require-jsdoc */
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
    /* eslint-enable jsdoc/require-jsdoc */
    /* eslint-disable jsdoc/require-jsdoc */
    promotionalCard: {
        gigaKombiOffer: {
            stdId: string;
            stdIcon: string;
            stdLabel: string;
            txtSublabelOffer: string;
            txtSublabelUnlimitedOffer: string;
            txtSublabelPriceOffer: string;
            shouldBeHiddenWith?: string[] | { [key: string]: string[] };
        },
        tradeInPromotionalCard: {
            stdId: string;
            stdIcon: string;
            stdLabel: string;
            txtSublabel: string;
            txtSublabelTauschbonus: string;
        },
    }
    /* eslint-enable jsdoc/require-jsdoc */
    /* eslint-disable jsdoc/require-jsdoc */
    gigaKombiNotification: Partial<{ [key in GigakombiType]: string }>,

}

declare global {
    interface Window {
        [ADDITIONAL_PAGE_OPTIONS]: AdditionalPageOptions;
    }
}
