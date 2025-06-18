/**
 * Generates a unique key for React elements in a list
 * @param {string} prefix - A prefix for the key
 * @param {string|number} id - An ID or index to make the key unique
 * @returns {string} A unique key string
 */
export const createKey = (prefix, id) => {
  return `${prefix}-${id}-${Math.random().toString(36).substr(2, 9)}`;
};
