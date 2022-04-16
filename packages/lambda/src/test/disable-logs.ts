import {vitest} from 'vitest';

export const disableLogs = () => {
	vitest.spyOn(console, 'log').mockImplementation(() => vitest.fn());
	vitest.spyOn(console, 'debug').mockImplementation(() => vitest.fn());
};

export const enableLogs = () => {
	vitest.spyOn(console, 'log').mockRestore();
	vitest.spyOn(console, 'debug').mockRestore();
};
