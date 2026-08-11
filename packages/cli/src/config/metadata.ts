let specifiedMetadata: Record<string, string>;

export const setMetadata = (metadata: Record<string, string>): void => {
	specifiedMetadata = metadata;
};

export const getMetadata = (): Record<string, string> => {
	return specifiedMetadata;
};

export const resetMetadata = (): void => {
	specifiedMetadata = undefined as unknown as Record<string, string>;
};
