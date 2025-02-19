const resolveFunctions: ((value: void) => void | PromiseLike<void>)[] = [];

export const noOpUntilRestart = () => {
	return new Promise<void>((resolve) => {
		resolveFunctions.push(resolve);
	});
};

export const signalRestart = () => {
	resolveFunctions.forEach((f) => {
		f();
	});
	resolveFunctions.length = 0;
};
