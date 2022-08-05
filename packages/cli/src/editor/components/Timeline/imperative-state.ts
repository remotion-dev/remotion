export let currentFrame = 0;
export let currentZoom = 1;
export let currentDuration = 1;
export let currentFps = 1;

export const getCurrentZoom = () => {
	return currentZoom;
};

export const setCurrentZoom = (z: number) => {
	currentZoom = z;
};

export const getCurrentFrame = () => {
	return currentFrame;
};

export const setCurrentFrame = (f: number) => {
	currentFrame = f;
};

export const getCurrentDuration = () => {
	return currentDuration;
};

export const setCurrentDuration = (d: number) => {
	currentDuration = d;
};

export const getCurrentFps = () => {
	return currentFps;
};

export const setCurrentFps = (d: number) => {
	currentFps = d;
};
