let enableRepro = false;

export const setRepro = (should: boolean) => {
	enableRepro = should;
};

export const getRepro = () => enableRepro;
