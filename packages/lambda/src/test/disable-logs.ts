import {vi} from 'vitest';

export const disableLogs = () => {
	vi.spyOn(console, 'log').mockImplementation(() => undefined);
	vi.spyOn(console, 'debug').mockImplementation(() => undefined);
};

export const enableLogs = () => {
	vi.spyOn(console, 'log').mockRestore();
	vi.spyOn(console, 'debug').mockRestore();
};
