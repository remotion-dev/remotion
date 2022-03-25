export const validateFolderName = (name: string) => {
	if (!isFolderNameValid(name)) {
		throw new Error(
			`Folder name can only contain a-z, A-Z, 0-9 and -. You passed ${name}`
		);
	}
};

const getRegex = () => /^([a-zA-Z0-9-])+$/g;

export const isFolderNameValid = (name: string) => name.match(getRegex());

export const invalidFolderNameErrorMessage = `Folder name must match ${String(
	getRegex()
)}`;
