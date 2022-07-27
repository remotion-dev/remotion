import type {DownloadMap} from 'remotion';

export const isBeyondLastFrame = (
	downloadMap: DownloadMap,
	src: string,
	time: number
) => {
	return (
		downloadMap.isBeyondLastFrameMap[src] &&
		time >= downloadMap.isBeyondLastFrameMap[src]
	);
};

export const markAsBeyondLastFrame = (
	downloadMap: DownloadMap,
	src: string,
	time: number
) => {
	downloadMap.isBeyondLastFrameMap[src] = time;
};
