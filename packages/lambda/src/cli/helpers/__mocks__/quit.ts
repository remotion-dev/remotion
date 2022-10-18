export const quit = (exitCode: number) => {
	throw new Error(`Exited process with code ${exitCode}`);
};
