/**
 * Replace placeholders in "{{placeholder}}" format in a string with the values from the given object
 */
const replaceCMSPlaceholder = (str: string, obj: Record<string, string | undefined>): string => {
    const placeholders = str.match(/\{\{[\s\S]*?\}\}*/g) || [];
    const placeholdersLength = placeholders.length;

    for (let i = 0; i < placeholdersLength; i++) {
        const placeholder = placeholders[i];
        const key = placeholder.replace(/{{|}}/g, '').trim();

        if (obj[key] !== undefined) {
            str = str.replace(placeholder, obj[key] as string);
        }
    }

    return str;
};

export default replaceCMSPlaceholder;
