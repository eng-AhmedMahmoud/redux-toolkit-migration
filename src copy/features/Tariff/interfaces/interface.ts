/* eslint no-use-before-define: 0 */
import { FlagBadgeColors } from '@vfde-brix/ws10/flag-badge';
import {
    RedTariff,
    SalesChannel,
    YoungTariff,
} from '@vfde-sails/constants';
import {
    DataVolume,
    PriceWithRuntime,
    TariffWithHardwareOffer,
    TariffWithHardwareResponse,
} from '@vfde-sails/glados-v2';
import { IInitialState as IInitialStateApp } from '../../App/interfaces/state';

/**
 * Promotional Summary Card Offer
 */
export interface PromotionalSummaryCardOffer {
    /**
     * Offer Price
     */
    offerPrice: number | null;
}

/**
 * Initial state
 */
export interface IInitialState {
    /**
     * Subscription Id
     */
    subscriptionId: RedTariff | YoungTariff | null;
    /**
     * promotional Summary Card Offer
     */
    promotionalSummaryCardOffer: PromotionalSummaryCardOffer,
}

/**
 * Interface of Tariff Properties
 */
export interface StateProps extends Pick<IInitialStateApp, 'isTauschbonus' | 'isTradeIn'>{
    /**
     * Atomic ID
     */
    atomicId: string | null;
    /**
     * Payload
     */
    subscriptionPayload?: TariffWithHardwareResponse | null;
   /**
    * Offers
    */
    offers: TariffWithHardwareOffer[] | null;
    /**
     * Subscription Id
     */
    subscriptionId: RedTariff | YoungTariff | null;
   /**
    * salesChannel
    */
    salesChannel: SalesChannel | null;
    /**
     * Device Id
     */
    deviceId: string | null;
    /**
     * offer
     */
    offer: TariffWithHardwareOffer | null;
    /**
     * Tariff price starting from month 1 (stairway, or EOL)
     * With discounts (if any), otherwise normal tariff price.
     */
    tariffPrice: PriceWithRuntime | null;
    /**
     * Final tariff price after stairway, ending at month 24
     * With discounts (if any), otherwise normal tariff price.
     */
    endTariffPrice: PriceWithRuntime | null;
    /**
     * Data volume starting from month 1 (stairway, or EOL)
     * Includes additional volume via discounts (if any), otherwise normal data volume.
     */
    dataVolume: DataVolume | null;
    /**
     * Final data volume after stairway, ending at month 24
     * Includes additional volume via discounts (if any), otherwise normal data volume.
     */
    endDataVolume: DataVolume | null;
    /**
     * True if there is a stairway price
     */
    hasStairway: boolean;
    /**
     * Strike price (if any)
     */
    strikePrice: PriceWithRuntime | null;
    /**
     * The price the customer has to pay initially (including insurance)
     */
    priceToPay: PriceWithRuntime | null;
    /**
     * The price the customer has to pay after end of stairway (including insurance)
     */
    endPriceToPay: PriceWithRuntime | null;
    /**
     * Device name
     */
    deviceName: string | null;
    /**
     * isRedplusEligible
     */
    isRedplusEligible: boolean;
    /**
     * promotionalSummaryCardOffer
     */
    promotionalSummaryCardOffer: PromotionalSummaryCardOffer;
}

/**
 * Promotional Card props from additionalPageOptions
 */
export interface PromotionalCardProps {
    /**
     * Id for HTML elements
     */
    stdId: string;
    /**
     * Label for title
     */
    stdLabel: string;
    /**
     * Icon
     */
    stdIcon: string;
    /**
     * Sub label
     */
    txtSublabel: string;
    /**
     * Checkbox
     */
    checkbox?: PromotionalCardCheckbox;
    /**
     * Flag badge
     */
    flagBadge?: PromotionalCardFlagBadge;
    /**
     * ShouldBeHiddenWith
     */
    shouldBeHiddenWith?: string[];
}

/**
 * Promotional Card checkbox props from additionalPageOptions
 */
interface PromotionalCardCheckbox {
    /**
     * Label
     */
    txtLabelText: string;
    /**
     * Value
     */
    stdValue: string;
    /**
     * Spacing
     */
    spacing: string;
    /**
     * Confirmation text
     */
    stdConfirmationText?: string;
}

/**
 * Promotional Card flag badge props from additionalPageOptions
 */
interface PromotionalCardFlagBadge {
    /**
     * Label
     */
    stdLabel: string;
    /**
     * Color
     */
    optColor: FlagBadgeColors;
}
