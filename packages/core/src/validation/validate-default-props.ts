export const validateDefaultAndInputProps = (
	defaultProps: unknown,
	name: 'defaultProps' | 'inputProps'
) => {
	if (!defaultProps) {
		return;
	}

	if (defaultProps !== 'object') {
		throw new Error(
			`"${name}" must be an object, but you passed a value of type ${typeof defaultProps}`
		);
	}
};
