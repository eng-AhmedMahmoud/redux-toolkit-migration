import {
    Button,
    createButton,
} from '@vfde-brix/ws10/button';

/**
 * Button component
 */
export const mountButton = (containerId: string, onClick?: CallableFunction): Button => {
    const container = document.getElementById(containerId) as HTMLElement;

    return container && createButton(container, {
        onClick,
    });
};

/**
 * Update button link
 */
export const updateButtonLink = (button: Button, linkHref: string): void => {

    button.update({ linkHref });
};
