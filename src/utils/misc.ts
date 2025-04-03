export const listify = (value?: string, separator = ","): string[] | undefined => value?.split(separator);

export const getRandomString = (size = 36, sub = 10) => Math.random().toString(size).substring(sub);

export const getRandomArray = (fill: () => any, size = 10) => Array.from({ length: Math.floor(Math.random() * size) }, fill);

export const secondsToHHMMSS = (seconds: number): string => {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;

	const fh = hours.toString().padStart(2, '0');
	const fm = minutes.toString().padStart(2, '0');
	const fs = remainingSeconds.toString().padStart(2, '0');

	return `${fh}:${fm}:${fs}`;
};

export const mstosec = (ms: number) => ms / 1000;

export const roundUp = (value: number | undefined, factor = 4): number => Math.ceil((value || 0) / factor) * factor;

export const truncate = (copy: string, max = 45): string => copy.length <= max ? copy : copy.slice(0, max) + "...";

export const argsToString = (args: any[]): string => args.filter(Boolean).join(" ");

export const sleep = async (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));