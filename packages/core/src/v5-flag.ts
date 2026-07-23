export const ENABLE_V5_BREAKING_CHANGES = false as const;

export const resolveV5Default = (value: boolean | undefined): boolean => {
	return value ?? ENABLE_V5_BREAKING_CHANGES;
};
