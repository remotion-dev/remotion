export const disableLogs = () => {
	jest.spyOn(console, 'log').mockImplementation(jest.fn());
	jest.spyOn(console, 'debug').mockImplementation(jest.fn());
};

export const enableLogs = () => {
	jest.spyOn(console, 'log').mockRestore();
	jest.spyOn(console, 'debug').mockRestore();
};
