import { PromotionalCard } from '@vfde-brix/ws10/promotional-card';
import {
    ADDITIONAL_PAGE_OPTIONS,
    SAILS_VVL_STORAGE,
} from '@vfde-sails/constants';
import { getTauschbonusAmount } from '@vfde-sails/page-options';
import { getSessionStorageItemJson } from '@vfde-sails/storage';
import { replacePlaceholders } from '@vfde-sails/utils';
import { updatePromotionalCard } from 'Component/PromotionalCard';
import {
    getIsTauschbonusEligible,
    updateTauschbonus,
} from 'Helper/getTauschbonusHelpers';

jest.mock('@vfde-sails/storage', () => ({
    getSessionStorageItemJson: jest.fn().mockImplementation(() => null),
}));
jest.mock('@vfde-sails/utils', () => ({
    replacePlaceholders: jest.fn(),
}));
jest.mock('Component/PromotionalCard', () =>({
    updatePromotionalCard: jest.fn(),
}));
jest.mock('@vfde-sails/page-options', () => ({
    getTauschbonusAmount: jest.fn(),
}));

describe('getTauschbonusHelpers', ()=>{
    afterEach(() => {
        sessionStorage.removeItem(SAILS_VVL_STORAGE);
        (<jest.Mock>getSessionStorageItemJson).mockImplementation(() => null);
    });

    describe('updateTauschbonus', () => {
        const tauschbonusPromotionalCard =
        { getPropertyByKey: jest.fn(),
            getProperties: jest.fn() } as unknown as PromotionalCard;

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should update the promotional card when tauschbonusValue is present', () => {
            const tauschbonusValue = 100;
            const propertyKey = 'Your bonus is {tauschbonusValue}!';
            (tauschbonusPromotionalCard.getPropertyByKey as jest.Mock)
                .mockReturnValue(propertyKey);
            const stdLabel = 'Your bonus is 100!';
            (replacePlaceholders as jest.Mock).mockReturnValue(stdLabel);
            updateTauschbonus( tauschbonusPromotionalCard, tauschbonusValue);
            expect(replacePlaceholders).toHaveBeenCalledWith(propertyKey, { tauschbonusValue });
            expect(updatePromotionalCard).toHaveBeenCalledWith(tauschbonusPromotionalCard, { stdLabel });
        });

    });

    describe('getIsTauschbonusEligible', () => {

        beforeEach(() => {
            // Reset the window ADDITIONAL_PAGE_OPTIONS object before each test
            (window as any)[ADDITIONAL_PAGE_OPTIONS] = {};
        });

        it('should return true when tauschbonus is defined', () => {
            window[ADDITIONAL_PAGE_OPTIONS].promos = {
                'tauschbonus': {
                    'tauschbonusSubline': 'Tauschbonus: <b>{{ tauschbonusValue }} € Rabatt pro Monat.</b> 12 Monate lang. Gilt ab dem Verkauf Deines alten Handys.',
                },
            };
            const mockTauschbonusAmount = 20;
            (getTauschbonusAmount as jest.Mock).mockReturnValue(mockTauschbonusAmount);

            const result = getIsTauschbonusEligible('1');
            expect(result).toBe(true);
        });

        it('should return false when tauschbonus is undefined', () => {
            window[ADDITIONAL_PAGE_OPTIONS].promos = {};
            const mockTauschbonusAmount = 20;
            (getTauschbonusAmount as jest.Mock).mockReturnValue(mockTauschbonusAmount);
            const result = getIsTauschbonusEligible('1');
            expect(result).toBe(false);
        });

        it('should return false when ADDITIONAL_PAGE_OPTIONS does not exist', () => {
            const result = getIsTauschbonusEligible('1');
            expect(result).toBe(false);
        });
    });
});
