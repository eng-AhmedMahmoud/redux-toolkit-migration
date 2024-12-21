import {
    ADDITIONAL_PAGE_OPTIONS,
    RED_L_VIRTUAL_ID,
    GIGAKOMBI_IP,
    RED_M_VIRTUAL_ID,
    RED_S_VIRTUAL_ID,
    RED_XL_VIRTUAL_ID,
    RED_XS_VIRTUAL_ID,
    SAILS_PARAM_CUSTOMER,
    SAILS_PARAM_DEVICE_ID,
    SAILS_PARAM_SALESCHANNEL,
    SAILS_PARAM_SUB_ID,
    SAILS_VVL_STORAGE,
    SALESCHANNEL_CONSUMER,
    SALESCHANNEL_YOUNG,
    YOUNG_L_VIRTUAL_ID,
    YOUNG_M_VIRTUAL_ID,
    YOUNG_S_VIRTUAL_ID,
    YOUNG_XL_VIRTUAL_ID,
    YOUNG_XS_VIRTUAL_ID,
} from '@vfde-sails/constants';
import { getQueryParam } from '@vfde-sails/utils';
import {
    Customer,
    getSessionStorageItemJson,
} from '@vfde-sails/storage';
import {
    getDeviceId,
    getGigakombiType,
    getIsGigakombiEligible,
    getIsRedplusEligible,
    getIsSimonlyEligible,
    getIsWinbackCustomer,
    getIsYoungEligible,
    getSalesChannel,
    getSubscriptionId,
} from '../getUserDataHelper';
import {
    GIGAMOBIL_TARIFF_OPTION_PICKER_CONTAINER_ID,
    GIGAMOBIL_YOUNG_TARIFF_OPTION_PICKER_CONTAINER_ID,
} from '../../features/Tariff/constants';

jest.mock('@vfde-sails/utils', () => ({
    getQueryParam: jest.fn().mockImplementation(() => null),
}));

jest.mock('@vfde-sails/storage', () => ({
    getSessionStorageItemJson: jest.fn().mockImplementation(() => null),
}));

jest.mock('@vfde-brix/ws10/styles', () => ({
    CLASSNAME_HIDDEN: 'ws10-hidden',
}));

jest.mock('@vfde-brix/ws10/option-picker', () => ({
    OPTION_PICKER_INPUT_CLASSNAME: 'ws10-option-picker__input',
}));

jest.mock('@vfde-brix/ws10/promotional-card', () => ({
    PROMOTIONAL_CARD_BASE_CLASSNAME: 'ws10-promotional-card',
}));

const customer: Partial<Customer> = {
    gigakombiType: GIGAKOMBI_IP,
    isGigakombiEligible: true,
};

describe('getUserDataHelper', () => {
    const gigamobilOptionPickerMock = document.createElement('div');
    const gigamobilYoungOptionPickerHtmlMock = document.createElement('div');

    beforeAll(() => {
        gigamobilOptionPickerMock.id = GIGAMOBIL_TARIFF_OPTION_PICKER_CONTAINER_ID;
        gigamobilYoungOptionPickerHtmlMock.id = GIGAMOBIL_YOUNG_TARIFF_OPTION_PICKER_CONTAINER_ID;
        gigamobilOptionPickerMock.innerHTML = `<input class="ws10-option-picker__input" value="133">
                                        <input class="ws10-option-picker__input" value="134">
                                        <input class="ws10-option-picker__input" value="135" checked>
                                        <input class="ws10-option-picker__input" value="136">
                                        <input class="ws10-option-picker__input" value="137">`;
        gigamobilYoungOptionPickerHtmlMock.innerHTML = `<input class="ws10-option-picker__input" value="138">
                                            <input class="ws10-option-picker__input" value="139">
                                            <input class="ws10-option-picker__input" value="140" checked>
                                            <input class="ws10-option-picker__input" value="141">
                                            <input class="ws10-option-picker__input" value="142">`;
        document.body.appendChild(gigamobilOptionPickerMock);
        document.body.appendChild(gigamobilYoungOptionPickerHtmlMock);
        (window as any)[ADDITIONAL_PAGE_OPTIONS] = {
            optionPicker: {
                defaultSubscriptionIds: {
                    gigaMobil: RED_M_VIRTUAL_ID,
                    gigaMobilYoung: YOUNG_M_VIRTUAL_ID,
                },
                subscriptionIds: {
                    consumer: [
                        RED_XS_VIRTUAL_ID,
                        RED_S_VIRTUAL_ID,
                        RED_M_VIRTUAL_ID,
                        RED_L_VIRTUAL_ID,
                        RED_XL_VIRTUAL_ID,
                    ],
                    young: [
                        YOUNG_XS_VIRTUAL_ID,
                        YOUNG_S_VIRTUAL_ID,
                        YOUNG_M_VIRTUAL_ID,
                        YOUNG_L_VIRTUAL_ID,
                        YOUNG_XL_VIRTUAL_ID,
                    ],
                    default: {
                        consumer: RED_M_VIRTUAL_ID,
                        young: YOUNG_M_VIRTUAL_ID,
                    },
                },
            },
        };
    });

    afterEach(() => {
        sessionStorage.removeItem(SAILS_VVL_STORAGE);
        (<jest.Mock>getQueryParam).mockImplementation(() => null);
        (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => null);
    });

    describe('getSalesChannel', () => {
        it('should get salesChannel from storage', () => {
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => ({
                [SAILS_PARAM_SALESCHANNEL]: SALESCHANNEL_CONSUMER,
            }));

            const salesChannel = getSalesChannel();

            expect(salesChannel).toEqual(SALESCHANNEL_CONSUMER);
        });

        it('should return salesChannel as consumer based on the tariffId in the url', () => {
            (<jest.Mock>getQueryParam).mockImplementation(() => RED_XL_VIRTUAL_ID);
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => ({
                [SAILS_PARAM_SALESCHANNEL]: SALESCHANNEL_YOUNG,
            }));

            const salesChannel = getSalesChannel();

            expect(salesChannel).toEqual(SALESCHANNEL_CONSUMER);
        });

        it('should return salesChannel as young based on the tariffId in the url and user is young eligible', () => {
            (<jest.Mock>getQueryParam).mockImplementation(() => YOUNG_M_VIRTUAL_ID);
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => ({
                [SAILS_PARAM_SALESCHANNEL]: SALESCHANNEL_CONSUMER,
                [SAILS_PARAM_CUSTOMER]: {
                    isYoungEligible: true,
                },
            }));

            const salesChannel = getSalesChannel();

            expect(salesChannel).toEqual(SALESCHANNEL_YOUNG);
        });

        it('should return salesChannel as consumer when the tariffId in the url is for a youn portfolio but user is not young eligible', () => {
            (<jest.Mock>getQueryParam).mockImplementation(() => YOUNG_M_VIRTUAL_ID);
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => ({
                [SAILS_PARAM_SALESCHANNEL]: SALESCHANNEL_CONSUMER,
                [SAILS_PARAM_CUSTOMER]: {
                    isYoungEligible: false,
                },
            }));

            const salesChannel = getSalesChannel();

            expect(salesChannel).toEqual(SALESCHANNEL_CONSUMER);
        });

        it('should return salesChannel as consumer from the storage when the tariffId in the url is invalid', () => {
            (<jest.Mock>getQueryParam).mockImplementation(() => 4444);
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => ({
                [SAILS_PARAM_SALESCHANNEL]: SALESCHANNEL_CONSUMER,
            }));

            const salesChannel = getSalesChannel();

            expect(salesChannel).toEqual(SALESCHANNEL_CONSUMER);
        });

        it('should return salesChannel as consumer from the storage when the tariffId in the url is GigaMobil Young L', () => {
            (<jest.Mock>getQueryParam).mockImplementation(() => YOUNG_L_VIRTUAL_ID);
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => ({
                [SAILS_PARAM_SALESCHANNEL]: SALESCHANNEL_CONSUMER,
            }));

            const salesChannel = getSalesChannel();

            expect(salesChannel).toEqual(SALESCHANNEL_CONSUMER);
        });
    });

    describe('getDeviceId', () => {
        it('should get deviceId from URL', () => {
            (<jest.Mock>getQueryParam).mockImplementation(() => 1234);
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => ({
                [SAILS_PARAM_DEVICE_ID]: 5678,
            }));

            const deviceId = getDeviceId();

            expect(deviceId).toEqual(1234);
        });

        it('should get deviceId from storage', () => {
            (<jest.Mock>getQueryParam).mockImplementation(() => null);
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => ({
                [SAILS_PARAM_DEVICE_ID]: 5678,
            }));

            const deviceId = getDeviceId();

            expect(deviceId).toEqual('5678');
        });
    });

    describe('getSubscriptionId', () => {

        it('from URL', () => {
            (<jest.Mock>getQueryParam).mockImplementation(() => RED_XL_VIRTUAL_ID);

            const subscription = getSubscriptionId(SALESCHANNEL_CONSUMER);

            const expected = RED_XL_VIRTUAL_ID;

            expect(subscription).toEqual(expected);
        });

        it('should get subscriptionId from storage', () => {
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => ({
                [SAILS_PARAM_SUB_ID]: {
                    [SALESCHANNEL_CONSUMER]: RED_XL_VIRTUAL_ID,
                },
            }));

            const subscriptionId = getSubscriptionId(SALESCHANNEL_CONSUMER);

            expect(subscriptionId).toEqual(RED_XL_VIRTUAL_ID);
        });

        it('should get subscriptionId from default when the one in stroage is not valid', () => {
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => ({
                [SAILS_PARAM_SUB_ID]: {
                    [SALESCHANNEL_CONSUMER]: 1234,
                },
                [SAILS_PARAM_SALESCHANNEL]: SALESCHANNEL_CONSUMER,
            }));

            const subscriptionId = getSubscriptionId(SALESCHANNEL_CONSUMER);

            expect(subscriptionId).toEqual(RED_M_VIRTUAL_ID);
        });

        it('should get default GigaMobil (M) subscriptiond', () => {
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => null);

            const subscriptionId = getSubscriptionId(SALESCHANNEL_CONSUMER);

            expect(subscriptionId).toEqual(RED_M_VIRTUAL_ID);
        });

        it('should get default GigaMobil Young (M) subscriptiond', () => {
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => null);

            const subscriptionId = getSubscriptionId(SALESCHANNEL_YOUNG);

            expect(subscriptionId).toEqual(YOUNG_M_VIRTUAL_ID);
        });
    });

    describe('getIsSimonlyEligible', () => {
        it('should return false if no customer data in storage', () => {
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => null);

            const isSimonlyEligible = getIsSimonlyEligible();
            expect(isSimonlyEligible).toEqual(false);
        });

        it('should get isSimonlyEligible from storage', () => {
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => ({
                [SAILS_PARAM_CUSTOMER]: {
                    isSimonlyEligible: true,
                },
            }));

            const isSimonlyEligible = getIsSimonlyEligible();
            expect(isSimonlyEligible).toEqual(true);
        });
    });

    describe('getIsYoungEligible', () => {
        it('should return false if no customer data in storage', () => {
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => null);

            const isYoungEligible = getIsYoungEligible();
            expect(isYoungEligible).toEqual(false);
        });

        it('should get isYoungEligible from storage', () => {
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => ({
                [SAILS_PARAM_CUSTOMER]: {
                    isYoungEligible: true,
                },
            }));

            const isYoungEligible = getIsYoungEligible();
            expect(isYoungEligible).toEqual(true);
        });
    });

    describe('getIsWinbackCustomer', () => {
        it('should return false if no customer data in storage', () => {
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => null);

            const isWinbackCustomer = getIsWinbackCustomer();
            expect(isWinbackCustomer).toEqual(false);
        });

        it('should get isWinbackCustomer from storage', () => {
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => ({
                [SAILS_PARAM_CUSTOMER]: {
                    isWinbackCustomer: true,
                },
            }));

            const isWinbackCustomer = getIsWinbackCustomer();
            expect(isWinbackCustomer).toEqual(true);
        });
    });

    describe('getIsRedplusEligible', () => {
        it('should return false if no customer data in storage', () => {
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => null);

            const isRedplusEligible = getIsRedplusEligible();
            expect(isRedplusEligible).toEqual(false);
        });

        it('should get isRedplusEligible from storage', () => {
            (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => ({
                [SAILS_PARAM_CUSTOMER]: {
                    isRedplusEligible: true,
                },
            }));

            const isRedplusEligible = getIsRedplusEligible();
            expect(isRedplusEligible).toEqual(true);
        });
    });
});
describe('getIsGigakombiEligible', ()=>{
    it('should return isGigakombiEligible from session storage', ()=>{
        (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => ({
            [SAILS_PARAM_CUSTOMER]: {
                isGigakombiEligible: true,
            },
            [SAILS_PARAM_SALESCHANNEL]: SALESCHANNEL_YOUNG,
        }));
        expect(getIsGigakombiEligible()).toBeTruthy();
    });
});

describe('getGigakombiType', () => {
    beforeEach(() => {
        (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => ({
            [SAILS_PARAM_CUSTOMER]: customer,
        }));
    });

    it('should get getGigakombiType ', () => {
        expect(getGigakombiType()).toEqual(GIGAKOMBI_IP);
    });
});
