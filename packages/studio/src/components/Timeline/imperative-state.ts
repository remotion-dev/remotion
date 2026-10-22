let currentFrame = 0;
let currentZoom = 1;
let currentDuration = 1;
let currentFps = 1;
let currentDimensions = {width: 1, height: 1};

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

export const getCurrentDimensions = () => {
	return currentDimensions;
};

export const setCurrentDimensions = (width: number, height: number) => {
	if (
		currentDimensions.width === width &&
		currentDimensions.height === height
	) {
		return;
	}

	currentDimensions = {width, height};
};
