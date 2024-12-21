/**
 * get Pibs From additionalPageOptions
 */
export const getPibs = (subscriptionId: string): string => {
    const { pibs } = (window as any).additionalPageOptions;

    return pibs[subscriptionId];
};
