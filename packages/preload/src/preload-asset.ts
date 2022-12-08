import {resolveRedirect} from './resolve-redirect';

const typesAllowed = [ 'video', 'audio', 'image', 'font' ];

export const preloadAsset = (src: string, elemType: string): (() => void) => {
	if (typeof document === 'undefined') {
		console.warn(
			'preloadAsset() was called outside the browser. Doing nothing.'
		);
		return () => undefined;
	}

	if (!typesAllowed.includes(elemType)) {
		console.warn(
			'preloadAsset() Error, elemType not supported. Doing nothing.',
			elemType
		);
		return () => undefined;
	}

	const resolved = resolveRedirect(src);

	let cancelled = false;

	if (navigator.userAgent.match(/Firefox\//)) {
		const link = document.createElement('link');
		link.rel = 'preload';
		link.as = elemType;
		resolved
			.then((realUrl) => {
				if (!cancelled) {
					link.href = realUrl;
					document.head.appendChild(link);
				}
			})
			.catch((err) => {
				console.log(`Failed to preload asset`, err);
			});
		return () => {
			cancelled = true;
			link.remove();
		};
	}

	const elem = document.createElement(elemType);
	elem.preload = 'auto';
	elem.controls = true;
	elem.style.display = 'none';
	resolved
		.then((realUrl) => {
			if (!cancelled) {
				elem.src = realUrl;
				document.body.appendChild(elem);
			}
		})
		.catch((err) => {
			console.log('Failed to preload asset', err);
		});

	return () => {
		cancelled = true;
		elem.remove();
	};
};
