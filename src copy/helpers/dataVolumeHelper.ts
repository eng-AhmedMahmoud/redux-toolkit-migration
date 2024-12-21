/**
 * Function to format dataVolume value to be using commas
 * @param {string} numberStr
 * @returns {string}
 */

const formatDataVolume = (numberStr: string): string => numberStr.toString().trim().replace('.', ',');

export default formatDataVolume;
