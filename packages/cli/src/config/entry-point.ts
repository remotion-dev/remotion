let entryPoint: string | null = null;

export const setEntryPoint = (ep: string) => {
	entryPoint = ep;
};

export const getEntryPoint = () => {
	return entryPoint;
};

export const resetEntryPoint = () => {
	entryPoint = null;
};
