/* eslint-disable no-console */
import {resolveRedirect} from './resolve-redirect';

const typesAllowed = ['video', 'audio', 'image', 'font'] as const;

export const isIosSafari = () => {
	if (typeof window === 'undefined') {
		return false;
	}

	const isIpadIPodIPhone = /iP(ad|od|hone)/i.test(window.navigator.userAgent);
	const isSafari = Boolean(
		navigator.userAgent.match(/Version\/[\d.]+.*Safari/),
	);
	const isChrome = Boolean(navigator.userAgent.match(/CriOS\//));
	return isIpadIPodIPhone && (isSafari || isChrome);
};

export const preloadAsset = (
	src: string,
	elemType: (typeof typesAllowed)[number],
): (() => void) => {
	const apiName = `preload${
		elemType.charAt(0).toUpperCase() + elemType.slice(1)
	}`;

	if (typeof document === 'undefined') {
		console.warn(apiName + '() was called outside the browser. Doing nothing.');
		return () => undefined;
	}

	if (!typesAllowed.includes(elemType)) {
		console.warn(
			apiName + '() Error, elemType not supported. Doing nothing.',
			elemType,
		);
		return () => undefined;
	}

	const resolved = resolveRedirect(src);

	let cancelled = false;

	if (
		navigator.userAgent.match(/Firefox\//) ||
		elemType === 'image' ||
		elemType === 'font'
	) {
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
	elem.preload =
		(elemType === 'video' || elemType === 'audio') && isIosSafari()
			? 'metadata'
			: 'auto';
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
