const validArchitectures = ['arm64', 'x86_64'] as const;

export type LambdaArchitecture = typeof validArchitectures[number];

export const validateArchitecture = (architecture: unknown) => {
	if (typeof architecture !== 'string') {
		throw new TypeError(
			'You must pass an architecture when deploying: One of ' +
				validArchitectures.join(', ')
		);
	}

	if (!validArchitectures.find((a) => a === architecture)) {
		throw new TypeError(
			`You must pass an "architecture" when deploying a function: either "arm64" or "x86_64"`
		);
	}
};
