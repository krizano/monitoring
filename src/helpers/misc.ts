import { randomUUID } from 'crypto';

export const uuid = randomUUID;

/**
 * @returns {string} yyyy-mm-dd hh:mm:ss
 */
export const dt = () => new Date()
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');
