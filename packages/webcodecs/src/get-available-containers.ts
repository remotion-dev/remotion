export const availableContainers = ['webm', 'mp4', 'wav', 'mp3'] as const;
export type ConvertMediaContainer = (typeof availableContainers)[number];

export const getAvailableContainers = (): readonly ConvertMediaContainer[] => {
	return availableContainers;
};
