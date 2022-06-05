const map: Record<string, number> = {};

export const isBeyondLastFrame = (src: string, time: number) => {
	return map[src] && time >= map[src];
};

export const markAsBeyondLastFrame = (src: string, time: number) => {
	map[src] = time;
};
