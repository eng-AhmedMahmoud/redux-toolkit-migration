import { getNewSelectedCapacity } from '../capacityHelper';

describe('capacityHelper', () => {
    it('Should get maximum capacity', () => {
        const expected = getNewSelectedCapacity([
            {
                displayLabel: '64 GB',
                sortValue: 64 * 1024,
            }, {
                displayLabel: '128 GB',
                sortValue: 128 * 1024,
            },
        ], {
            displayLabel: '256 GB',
            sortValue: 256 * 1024,
        });
        expect(expected.displayLabel).toBe('128 GB');
    });

    it('Should get minimum capacity', () => {
        const expected = getNewSelectedCapacity([
            {
                displayLabel: '128 GB',
                sortValue: 128 * 1024,
            },
            {
                displayLabel: '256 GB',
                sortValue: 256 * 1024,
            },
        ], {
            displayLabel: '64 GB',
            sortValue: 64 * 1024,
        });
        expect(expected.displayLabel).toBe('128 GB');
    });

    it('Should get next bigger capacity', () => {
        const expected = getNewSelectedCapacity([
            {
                displayLabel: '32 GB',
                sortValue: 32 * 1024,
            },
            {
                displayLabel: '128 GB',
                sortValue: 128 * 1024,
            },
            {
                displayLabel: '256 GB',
                sortValue: 256 * 1024,
            },
        ], {
            displayLabel: '64 GB',
            sortValue: 64 * 1024,
        });
        expect(expected.displayLabel).toBe('128 GB');
    });

    it('should get identical capacity', () => {
        const expected = getNewSelectedCapacity([
            {
                displayLabel: '32 GB',
                sortValue: 32 * 1024,
            },
            {
                displayLabel: '128 GB',
                sortValue: 128 * 1024,
            },
            {
                displayLabel: '256 GB',
                sortValue: 256 * 1024,
            },
        ], {
            displayLabel: '256 GB',
            sortValue: 256 * 1024,
        });
        expect(expected.displayLabel).toBe('256 GB');
    });

    it('should work with different units', () => {
        const expected = getNewSelectedCapacity([
            {
                displayLabel: '32 GB',
                sortValue: 32 * 1024,
            },
            {
                displayLabel: '756 MB',
                sortValue: 756,
            },
            {
                displayLabel: '1 TB',
                sortValue: 1024 * 1024,
            },
        ], {
            displayLabel: '512 GB',
            sortValue: 512 * 1024,
        });
        expect(expected.displayLabel).toBe('1 TB');
    });
});
