import {
    ADDITIONAL_PAGE_OPTIONS,
    BTX_VVL,
} from '@vfde-sails/constants';
import {
    TRACKING_PLATFORM_TYPE_RESPONSIVE,
    TRACKING_PRODUCT_LINE,
    TRACKING_PRODUCT_TYPE,
    TRACKING_SITE_AREA_MOBILITY,
    TrackingProduct,
    TrackingProposition,
    getCustomerFlow,
    TrackingError,
    getSiteStructure,
    getLoginData,
    trackIt,
    TRACKING_FLOWTYPE_STORAGE,
    TrackingFlowType,
    TrackingLoginStatus,
    TrackingProductType,
    TrackingBtx,
    TrackingPageType,
    TrackType,
    TRACKING_INFORMATION_ACTION_REVEAL,
    TrackingInformation,
    PageViewTrackingData,
    TrackToggleOption,
    addTrackingToAction,
    TrackingInformationUiType,
    TrackingInformationTrigger,
} from '@vfde-sails/tracking';
import { selectTrackingPayload } from '../selectors';
import { getIsWinbackCustomer } from '../../../helpers/getUserDataHelper';
import { SelectorReturnType } from '@vfde-sails/core';
import {
    getSessionStorageItemJson,
    setSessionStorageItemJson,
} from '@vfde-sails/storage';
import { decodeHtml } from '@vfde-sails/utils';
import {
    OfferType,
    PriceType,
} from '@vfde-sails/glados-v2';
import { getTradeInDiscountSoc } from '@vfde-sails/page-options';
import type { Device } from '../../TradeIn/interfaces/api';
import {
    call,
    put,
    select,
} from 'redux-saga/effects';
import { trackPageView } from '../slice';

/**
 * Create the page view tracking object
 */
export const createPageViewTrackingData = ({
    salesChannel,
    subscriptionId,
    activeOffer,
    atomicDevice,
    priceToPay,
}: SelectorReturnType<typeof selectTrackingPayload>): PageViewTrackingData | null => {
    if (!atomicDevice) {
        return null;
    }

    const { pageName } = window[ADDITIONAL_PAGE_OPTIONS];
    const { label } = atomicDevice;

    const siteStructure = getSiteStructure(pageName, BTX_VVL);
    const loginStatus = getLoginData() ? TrackingLoginStatus.LoggedIn : TrackingLoginStatus.NotLoggedIn;
    const lineOfCustomer = getCustomerFlow(salesChannel!);
    const productCategory = TrackingProductType.Bundle;
    const devicePriceOnce = activeOffer?.prices[OfferType.Composition][OfferType.HardwareOnly][PriceType.Onetime].withoutDiscounts.gross;

    // This html-decodes the encoded umlauts from vlux into actual umlauts
    const atomicName = decodeHtml(label);
    let propositionName = atomicName;

    const aProducts: TrackingProduct[] = [];

    const trackingDevice: TrackingProduct = {
        sku: atomicDevice.backendId,
        name: atomicName,
        type: TrackingProductType.Device,
        priceOnce: (devicePriceOnce || 0).toString(),
        proposition: 1,
        units: 1,
    };

    const trackingTariff: TrackingProduct = {
        sku: subscriptionId!,
        name: activeOffer?.tariffName || '',
        type: TrackingProductType.Tariff,
        priceOnce: (devicePriceOnce || 0).toString(),
        priceMonthly: priceToPay?.gross.toString(),
        duration: 24,
        proposition: 1,
        units: 1,
    };

    aProducts.push(trackingDevice);
    aProducts.push(trackingTariff);

    propositionName += ` | ${activeOffer?.tariffName}`;

    const aPropositions: TrackingProposition[] = [{
        id: 1,
        name: propositionName,
        targetAudience: lineOfCustomer,
        retention: TrackingBtx.Vvl,
        productType: TRACKING_PRODUCT_TYPE,
        productLine: TRACKING_PRODUCT_LINE,
        productCategory: productCategory,
        units: 1,
    }];

    const trackingPayload: PageViewTrackingData = {
        /* eslint-disable @typescript-eslint/naming-convention, camelcase */
        page_levels: siteStructure,
        is_winback_customer: getIsWinbackCustomer(),
        login_status: loginStatus,
        flow_type: geFlowTypeStorage(),
        line_of_customer: lineOfCustomer,
        page_type: TrackingPageType.ProductDetail,
        site_area: TRACKING_SITE_AREA_MOBILITY,
        platform_type: TRACKING_PLATFORM_TYPE_RESPONSIVE,
        business_transaction_type: TrackingBtx.Vvl,
        /* eslint-enable @typescript-eslint/naming-convention, camelcase */
        oOrder: {
            aProducts,
            aPropositions,
        },
    };

    return trackingPayload;
};

/**
 * Get flowtype from/in storage
 */
export const geFlowTypeStorage = (): TrackingFlowType => {
    let flowType = getSessionStorageItemJson(TRACKING_FLOWTYPE_STORAGE) as TrackingFlowType;

    if (!flowType) {
        flowType = TrackingFlowType.VvlProductDetails;
        setSessionStorageItemJson(TRACKING_FLOWTYPE_STORAGE, flowType);
    }

    return flowType;
};

/**
 * Tracks the opening of an overlay
 */
export const trackOverlayReveal = () => {
    const overlayRevealTrackingData: TrackingInformation = {
        /* eslint-disable @typescript-eslint/naming-convention, camelcase */
        information_action: TRACKING_INFORMATION_ACTION_REVEAL,
        information_name: 'produktdetails',
        information_ui_type: TrackingInformationUiType.Overlay,
        information_trigger: TrackingInformationTrigger.Anchor,
        /* eslint-enable */
    };

    trackIt(TrackType.Information, overlayRevealTrackingData);
};

/**
 * Tracks error
 */
export const trackError = (trackingError: TrackingError) => {
    trackIt(TrackType.Error, trackingError);
};

/**
 * Get tracking payload for trade in
 */
// @todo The used tracking data here are from the BNT flow replace them after
// we get the right data from the business team
export function getTradeInTrackingPayload (isTradeInSelected: boolean, tradeInDevice: Device | null): {
    trackingType: TrackType;
    trackingPayload: { [key in TrackToggleOption]?: TrackingProduct[] } | TrackingInformation;
} {
    if (!tradeInDevice && isTradeInSelected) {
        return {
            trackingType: TrackType.Information,
            trackingPayload: {
                /* eslint-disable @typescript-eslint/naming-convention, camelcase */
                information_action: TRACKING_INFORMATION_ACTION_REVEAL,
                information_name: 'trade-in option',
                information_ui_type: TrackingInformationUiType.Overlay,
                information_trigger: TrackingInformationTrigger.Anchor,
                /* eslint-enable */
            },
        };
    }

    return {
        trackingType: TrackType.SwitchOptions,
        trackingPayload: {
            [isTradeInSelected && tradeInDevice ? TrackToggleOption.Selected : TrackToggleOption.Removed]: [{
                sku: getTradeInDiscountSoc(),
                name: `trade in ${tradeInDevice?.name}`,
                type: TrackingProductType.Discount,
                priceOnce: tradeInDevice?.formattedPrice,
                // TODO: don't hardcode price
                // How could this even be approved like this
                // and Digital Power not complain about it?
                // TradeIn does not have a monthly price.
                // Maybe we should just change this to '0'?
                // This line is from September 10, 2021 and now we are in the situation
                // that nobody remembers what is right and what is wrong.
                // But at least I found the tag-plan in CO-27730 for future reference.
                priceMonthly: '15.00',
                proposition: 1,
                units: 1,
            }],
        },
    };
}

/**
 * Create Tracking Data
 */
export function* createTrackingData () {
    const trackingData = (yield select(selectTrackingPayload())) as SelectorReturnType<typeof selectTrackingPayload>;
    const trackingPayload = (yield call(createPageViewTrackingData, trackingData)) as ReturnType<typeof createPageViewTrackingData>;

    yield put(addTrackingToAction(
        trackPageView(),
        TrackType.PageView,
        trackingPayload!,
    ));
}
