import { getTradeInPromotionCardProperties } from '../tradeInPromotionalCardHelper';
import { getTauschbonusAmount } from '@vfde-sails/page-options';

jest.mock('@vfde-sails/page-options', () => ({
    getTauschbonusAmount: jest.fn(),
}));

jest.mock('@vfde-brix/ws10/promotional-card', () => ({
    PROMOTIONAL_CARD_BASE_CLASSNAME: 'ws10-promotional-card',
}));

describe('getTradeInPromotionCardProperties', () => {
    beforeEach(() => {
        (window as any).additionalPageOptions = {
            promotionalCard: {
                tradeInPromotionalCard: {
                    stdId: 'tradeIn-tauschbonus-promotional-card',
                    stdIcon: 'tick',
                    stdLabel: 'Du hast die Inzahlungnahme aktiviert',
                    txtSublabel:
                        'Für Dein altes Smartphone bekommst Du eine <strong>einmalige Gutschrift.</strong>',
                    txtSublabelTauschbonus:
                        'Für Dein altes Smartphone bekommst Du eine <strong>einmalige Gutschrift.</strong> Und dazu den Tauschbonus: <strong>{{tauschbonusAmount}} &euro; Rabatt pro Monat.</strong> 12 Monate lang. Gilt ab dem Verkauf Deines alten Handys.',
                },
            },
        };
    });

    it('should return tradeInPromotionalCard with tauschbonus properties when isTauschbonus is true', () => {
        const deviceId = '59';
        const tradeInPromotionalCard = (window as any).additionalPageOptions.promotionalCard.tradeInPromotionalCard;
        const mockTauschbonusAmount = 20;
        (getTauschbonusAmount as jest.Mock).mockReturnValue(mockTauschbonusAmount);

        const result = getTradeInPromotionCardProperties(true, deviceId);

        expect(result).toEqual({
            ...tradeInPromotionalCard,
            txtSublabel:
                'Für Dein altes Smartphone bekommst Du eine <strong>einmalige Gutschrift.</strong> Und dazu den Tauschbonus: <strong>20 &euro; Rabatt pro Monat.</strong> 12 Monate lang. Gilt ab dem Verkauf Deines alten Handys.',
        });
    });

    it('should return tradeInPromotionalCard  without tauschbonus properties when isTauschbonus is false', () => {
        const deviceId = '59';
        const tradeInPromotionalCard = (window as any).additionalPageOptions.promotionalCard.tradeInPromotionalCard;
        const result = getTradeInPromotionCardProperties(false, deviceId);

        expect(result).toEqual({
            ...tradeInPromotionalCard,
        });
    });
});
