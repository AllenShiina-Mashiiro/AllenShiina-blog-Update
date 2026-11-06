export const HANDLE_PATTERN = /^[a-z0-9_]{3,30}$/;
export function normalizeHandle(value: string) { return value.trim().toLowerCase(); }
export function isValidHandle(value: string) { return HANDLE_PATTERN.test(value); }
export function publicHandle(value: string) { return `@${value}`; }
