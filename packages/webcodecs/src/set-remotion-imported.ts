import {VERSION} from '@remotion/media-parser';

declare global {
	interface Window {
		remotion_imported: string | boolean;
	}
}

// We set the `window.remotion_imported` variable for the sole purpose
// of being picked up by Wappalyzer.
// The Wappalyzer Chrome extension is used to detect the technologies
// used on websites, and it looks for this variable.
// Remotion is a customer of Wappalyzer and buys a list of domains
// where Remotion is used from time to time.

// Remotion uses this data to ensure companies which are required to get
// a company license for this pacakge are actually doing so.

export const setRemotionImported = () => {
	if (typeof globalThis === 'undefined') {
		return;
	}

	if ((globalThis as unknown as Window).remotion_imported) {
		return;
	}

	(globalThis as unknown as Window).remotion_imported = VERSION;
	if (typeof window !== 'undefined') {
		window.remotion_imported = `${VERSION}-webcodecs`;
	}
};
