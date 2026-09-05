type StudioAction = 'restart' | 'shutdown';
const resolveFunctions: ((value: StudioAction) => void)[] = [];

export const noOpUntilRestart = () => {
	return new Promise<StudioAction>((resolve) => {
		resolveFunctions.push(resolve);
	});
};

export const signalRestart = () => {
	resolveFunctions.splice(0).forEach((resolve) => resolve('restart'));
};

export const signalShutdown = () => {
	resolveFunctions.splice(0).forEach((resolve) => resolve('shutdown'));
};
