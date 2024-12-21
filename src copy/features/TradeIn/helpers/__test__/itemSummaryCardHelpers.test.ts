import {
    IItemSummaryCardItemProperties,
    IItemSummaryCardBusinessLogic,
    ItemSummaryCard,
    OptVariant,
} from '@vfde-brix/ws10/item-summary-card';
import { updateItemSummaryCard } from '../../helpers/itemSummaryCardHelpers';
// import { OptVariant } from '@vfde-brix/ws10/item-summary-card';

jest.mock('@vfde-brix/ws10/item-summary-card', () => ({
    ItemSummaryCard: jest.fn().mockImplementation(() => ({
        update: jest.fn(),
        toggleContainer: jest.fn(),
    })),
}));

describe('updateItemSummaryCard', () => {
    let itemSummaryCard: ItemSummaryCard;
    let mockElement: HTMLElement;
    let mockProperties: IItemSummaryCardItemProperties[];
    const mockBusiness: IItemSummaryCardBusinessLogic = {
        onButtonLinkClick: jest.fn(),
        onDeleteButtonClick: jest.fn(),
    };
    const mockItemSummaryCardProps = {
        items: [],
        optVariant: 'Standalone' as OptVariant,
        business: mockBusiness,
    };

    beforeEach(() => {
        mockElement = document.createElement('div');
        mockProperties = [
            { stdHeadline: 'Item 1', business: mockBusiness },
            { stdHeadline: 'Item 2', business: mockBusiness },
        ];
        itemSummaryCard = new ItemSummaryCard(mockElement, mockItemSummaryCardProps);
    });

    it('should update the ItemSummaryCard with the given properties', () => {
        updateItemSummaryCard(itemSummaryCard, mockProperties);

        expect(itemSummaryCard.update).toHaveBeenCalledWith({
            items: mockProperties,
        });
    });

    it('should handle empty item properties', () => {
        mockProperties = [];

        updateItemSummaryCard(itemSummaryCard, mockProperties);

        expect(itemSummaryCard.update).toHaveBeenCalledWith({
            items: mockProperties,
        });
    });

    it('should update the ItemSummaryCard with a single item property', () => {
        mockProperties = [{ stdHeadline: 'Single Item', business: mockBusiness }];

        updateItemSummaryCard(itemSummaryCard, mockProperties);

        expect(itemSummaryCard.update).toHaveBeenCalledWith({
            items: mockProperties,
        });
    });

    it('should not throw an error with null item properties', () => {
        mockProperties = null as unknown as IItemSummaryCardItemProperties[];

        expect(() => {
            updateItemSummaryCard(itemSummaryCard, mockProperties);
        }).not.toThrow();

        expect(itemSummaryCard.update).toHaveBeenCalledWith({
            items: mockProperties,
        });
    });

    it('should handle undefined item properties', () => {
        mockProperties = undefined as unknown as IItemSummaryCardItemProperties[];

        expect(() => {
            updateItemSummaryCard(itemSummaryCard, mockProperties);
        }).not.toThrow();

        expect(itemSummaryCard.update).toHaveBeenCalledWith({
            items: mockProperties,
        });
    });
});
