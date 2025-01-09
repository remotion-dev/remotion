let specifiedMetadata: Record<string, string>;

export const setMetadata = (metadata: Record<string, string>): void => {
	specifiedMetadata = metadata;
};

export const getMetadata = (): Record<string, string> => {
	return specifiedMetadata;
};
