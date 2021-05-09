declare global {
	interface Document {
		webkitFullscreenEnabled?: boolean;
		webkitFullscreenElement?: Element;
		webkitExitFullscreen?: Document['exitFullscreen'];
	}
	interface HTMLDivElement {
		webkitRequestFullScreen: HTMLDivElement['requestFullscreen'];
	}
}

export const browserSupportsFullscreen =
	typeof document !== 'undefined' &&
	(document.fullscreenEnabled || document.webkitFullscreenEnabled);
