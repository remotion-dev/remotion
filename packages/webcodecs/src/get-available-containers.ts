export const availableContainers = ['webm', 'mp4', 'wav'] as const;
export type ConvertMediaContainer = (typeof availableContainers)[number];

/**
 * @deprecated Use Mediabunny instead: https://www.remotion.dev/docs/mediabunny
 */
export const getAvailableContainers = (): readonly ConvertMediaContainer[] => {
	return availableContainers;
};
