export const log = (type: string, content: string) => console.log(`[${type}]`, content);
export const warn = (type: string, content: string) => console.warn(`[${type}]`, content);
export const error = (type: string, content: string) => console.error(`[${type}]`, content);