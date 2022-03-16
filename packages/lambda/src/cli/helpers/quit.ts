export const quit = (exitCode: number): never => {
	process.exit(exitCode);
};
