if (typeof window !== 'undefined') {
	window.ready = true;
}

export const deferRender = (): void => {
	if (typeof window !== 'undefined') {
		window.ready = false;
	}
};

export const readyToRender = (): void => {
	if (typeof window !== 'undefined') {
		window.ready = true;
	}
};

declare global {
	interface Window {
		ready: boolean;
	}
}
