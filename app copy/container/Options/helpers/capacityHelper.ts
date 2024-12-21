import { Capacity } from '@vfde-sails/glados-v2';

/**
 * Get new capacity to be selected when current capacity is not available in the new selected color
 */
export const getNewSelectedCapacity = (availableCapacities: Capacity[], currentCapacity: Capacity): Capacity => {
    let newCapacity: Capacity;
    const minCapacity = Math.min(...availableCapacities.map(capacity => capacity.sortValue));
    const maxCapacity = Math.max(...availableCapacities.map(capacity => capacity.sortValue));

    switch (true) {
        case (availableCapacities.some(capacity => capacity.displayLabel === currentCapacity.displayLabel)):
            // the currentCapacity is still among the availableCapacities so we just return the currentCapacity
            newCapacity = currentCapacity;
            break;
        case (currentCapacity.sortValue > maxCapacity):
            // the current capacity is bigger than the biggest available capacity, so we select the biggest available capacity
            newCapacity = availableCapacities[availableCapacities.findIndex(capacity => capacity.sortValue === maxCapacity)];
            break;
        case (currentCapacity.sortValue < minCapacity):
            // the current capacity is less than the smallest available capacity, so we select the smallest available capacity
            newCapacity = availableCapacities[availableCapacities.findIndex(capacity => capacity.sortValue === minCapacity)];
            break;
        default:
            // the currentCapacity is not among the availableCapacities and it is not smaller than the smallest
            // or bigger than the biggest availableCapacities so we pick the next bigger capacity
            newCapacity = availableCapacities[availableCapacities.findIndex(capacity => capacity.sortValue > currentCapacity.sortValue)];
            break;
    }

    return newCapacity;
};
