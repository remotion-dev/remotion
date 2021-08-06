export const INITIAL_FRAME_LOCAL_STORAGE_KEY = 'remotion.initialFrame';

const getInitialFrame = (): number => {
	const param = localStorage.getItem(INITIAL_FRAME_LOCAL_STORAGE_KEY);
	return param ? Number(param) : 0;
};

export const setupInitialFrame = () => {
	window.remotion_initialFrame = getInitialFrame();
};
