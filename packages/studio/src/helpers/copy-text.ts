export const copyText = (cmd: string): Promise<void> => {
	return navigator.clipboard.writeText(cmd);
};
