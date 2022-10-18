export const validateCompositionId = (id: string) => {
	if (!isCompositionIdValid(id)) {
		throw new Error(
			`Composition id can only contain a-z, A-Z, 0-9 and -. You passed ${id}`
		);
	}
};

const getRegex = () => /^([a-zA-Z0-9-])+$/g;

export const isCompositionIdValid = (id: string) => id.match(getRegex());

export const invalidCompositionErrorMessage = `Composition ID must match ${String(
	getRegex()
)}`;
