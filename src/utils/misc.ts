export const listify = (value: string, separator = ","): string[] => value.split(separator);

export const getRandomString = (size = 36, sub = 10) => Math.random().toString(size).substring(sub);

export const getRandomArray = (fill: () => any, size = 10) => Array.from({ length: Math.floor(Math.random() * size) }, fill);