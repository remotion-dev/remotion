const getRegex = () => /^([a-zA-Z0-9-\u4E00-\u9FFF])+$/g;

export const isCompositionIdValid = (id: string) => id.match(getRegex());

export const validateCompositionId = (id: string) => {
	if (!isCompositionIdValid(id)) {
		throw new Error(
			`Composition id can only contain a-z, A-Z, 0-9, CJK characters and -. You passed ${id}`,
		);
	}
};

export const invalidCompositionErrorMessage = `Composition ID must match ${String(
	getRegex(),
)}`;
