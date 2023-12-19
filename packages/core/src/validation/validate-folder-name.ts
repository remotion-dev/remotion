const getRegex = () => /^([a-zA-Z0-9-\u4E00-\u9FFF])+$/g;

export const isFolderNameValid = (name: string) => name.match(getRegex());

export const validateFolderName = (name: string | null) => {
	if (name === undefined || name === null) {
		throw new TypeError('You must pass a name to a <Folder />.');
	}

	if (typeof name !== 'string') {
		throw new TypeError(
			`The "name" you pass into <Folder /> must be a string. Got: ${typeof name}`,
		);
	}

	if (!isFolderNameValid(name)) {
		throw new Error(
			`Folder name can only contain a-z, A-Z, 0-9 and -. You passed ${name}`,
		);
	}
};

export const invalidFolderNameErrorMessage = `Folder name must match ${String(
	getRegex(),
)}`;
