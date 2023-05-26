export const validateDefaultAndInputProps = (
	defaultProps: unknown,
	name: 'defaultProps' | 'inputProps'
) => {
	if (!defaultProps) {
		return;
	}

	if (typeof defaultProps !== 'object') {
		throw new Error(
			`"${name}" must be an object, but you passed a value of type ${typeof defaultProps}`
		);
	}

	if (Array.isArray(defaultProps)) {
		throw new Error(`"${name}" must be an object, but you passed an array`);
	}
};
