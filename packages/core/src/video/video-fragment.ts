import {useRef} from 'react';

const toSeconds = (time: number, fps: number) => {
	return Math.round((time / fps) * 100) / 100;
};

export const isSafari = () => {
	if (typeof window === 'undefined') {
		return false;
	}

	const isAppleWebKit = /AppleWebKit/.test(window.navigator.userAgent);

	if (!isAppleWebKit) {
		return false;
	}

	const isNotChrome = !window.navigator.userAgent.includes('Chrome/');

	return isNotChrome;
};

export const isIosSafari = () => {
	if (typeof window === 'undefined') {
		return false;
	}

	const {userAgent, platform, maxTouchPoints} = window.navigator;

	const isIpadIPodIPhone = /iP(ad|od|hone)/i.test(userAgent);

	// Since iPadOS 13, Safari on iPad defaults to "Request Desktop Website"
	// and sends a macOS user agent ("Macintosh; Intel Mac OS X 10_15_7"),
	// so the string above never matches. A Mac platform with a touch
	// screen is the only remaining signal — real Macs report 0 touch
	// points. Without this, iPads get the blob + media fragment
	// combination that Mobile Safari refuses to play (#1655).
	const isIpadOsDesktopMode = platform === 'MacIntel' && maxTouchPoints > 1;

	return (isIpadIPodIPhone || isIpadOsDesktopMode) && isSafari();
};

// https://github.com/remotion-dev/remotion/issues/1655
const isIOSSafariAndBlob = (actualSrc: string) => {
	return isIosSafari() && actualSrc.startsWith('blob:');
};

const getVideoFragmentStart = ({
	actualFrom,
	fps,
}: {
	actualFrom: number;
	fps: number;
}) => {
	return toSeconds(Math.max(0, -actualFrom), fps);
};

const getVideoFragmentEnd = ({
	duration,
	fps,
}: {
	duration: number;
	fps: number;
}) => {
	return toSeconds(duration, fps);
};

export const appendVideoFragment = ({
	actualSrc,
	actualFrom,
	duration,
	fps,
}: {
	actualSrc: string;
	actualFrom: number;
	duration: number;
	fps: number;
}): string => {
	if (isIOSSafariAndBlob(actualSrc)) {
		return actualSrc;
	}

	if (actualSrc.startsWith('data:')) {
		return actualSrc;
	}

	const existingHash = Boolean(
		new URL(
			actualSrc,
			(typeof window === 'undefined' ? null : window.location.href) ??
				'http://localhost:3000',
		).hash,
	);

	if (existingHash) {
		return actualSrc;
	}

	if (!Number.isFinite(actualFrom)) {
		return actualSrc;
	}

	const withStartHash = `${actualSrc}#t=${getVideoFragmentStart({actualFrom, fps})}`;

	if (!Number.isFinite(duration)) {
		return withStartHash;
	}

	return `${withStartHash},${getVideoFragmentEnd({duration, fps})}`;
};

const isSubsetOfDuration = ({
	prevStartFrom,
	newStartFrom,
	prevDuration,
	newDuration,
	fps,
}: {
	prevStartFrom: number;
	newStartFrom: number;
	prevDuration: number;
	newDuration: number;
	fps: number;
}) => {
	const previousFrom = getVideoFragmentStart({actualFrom: prevStartFrom, fps});
	const newFrom = getVideoFragmentStart({actualFrom: newStartFrom, fps});
	const previousEnd = getVideoFragmentEnd({duration: prevDuration, fps});
	const newEnd = getVideoFragmentEnd({duration: newDuration, fps});

	if (newFrom < previousFrom) {
		return false;
	}

	if (newEnd > previousEnd) {
		return false;
	}

	return true;
};

export const useAppendVideoFragment = ({
	actualSrc: initialActualSrc,
	actualFrom: initialActualFrom,
	duration: initialDuration,
	fps,
}: {
	actualSrc: string;
	actualFrom: number;
	duration: number;
	fps: number;
}) => {
	const actualFromRef = useRef(initialActualFrom);
	const actualDuration = useRef(initialDuration);
	const actualSrc = useRef(initialActualSrc);

	if (
		!isSubsetOfDuration({
			prevStartFrom: actualFromRef.current,
			newStartFrom: initialActualFrom,
			prevDuration: actualDuration.current,
			newDuration: initialDuration,
			fps,
		}) ||
		initialActualSrc !== actualSrc.current
	) {
		actualFromRef.current = initialActualFrom;
		actualDuration.current = initialDuration;
		actualSrc.current = initialActualSrc;
	}

	const appended = appendVideoFragment({
		actualSrc: actualSrc.current,
		actualFrom: actualFromRef.current,
		duration: actualDuration.current,
		fps,
	});

	return appended;
};
