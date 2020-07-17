let ready = true;

export const deferRender = (): void => {
	ready = false;
};

export const readyToRender = (): void => {
	ready = true;
};

declare global {
	interface Window {
		isReady: () => boolean;
	}
}

if (typeof window !== 'undefined') {
	window.isReady = (): boolean => {
		return ready;
	};
}
