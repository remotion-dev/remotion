export const validateDefaultAndInputProps = (
	defaultProps: unknown,
	name: 'defaultProps' | 'inputProps',
	compositionId: string | null,
) => {
	if (!defaultProps) {
		return;
	}

	if (typeof defaultProps !== 'object') {
		throw new Error(
			`"${name}" must be an object, but you passed a value of type ${typeof defaultProps}`,
		);
	}

	if (Array.isArray(defaultProps)) {
		throw new Error(
			`"${name}" must be an object, an array was passed ${
				compositionId ? `for composition "${compositionId}"` : ''
			}`,
		);
	}
};
