export const dt = () => new Date()
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');
