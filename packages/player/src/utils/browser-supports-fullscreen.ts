import {IS_NODE} from './is-node';

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

export const browserSupportsFullscreen = IS_NODE
	? false
	: document.fullscreenEnabled || document.webkitFullscreenEnabled;
