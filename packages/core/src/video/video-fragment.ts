import {useRef} from 'react';

const toSeconds = (time: number, fps: number) => {
	return Math.round((time / fps) * 100) / 100;
};

export const isIosSafari = () => {
	return typeof window === 'undefined'
		? false
		: /iP(ad|od|hone)/i.test(window.navigator.userAgent) &&
				Boolean(navigator.userAgent.match(/Version\/[\d.]+.*Safari/));
};

// https://github.com/remotion-dev/remotion/issues/1655
const isIOSSafariAndBlob = (actualSrc: string) => {
	return isIosSafari() && actualSrc.startsWith('blob:');
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

	actualSrc += `#t=${toSeconds(-actualFrom, fps)}`;

	if (!Number.isFinite(duration)) {
		return actualSrc;
	}

	actualSrc += `,${toSeconds(duration, fps)}`;

	return actualSrc;
};

const isSubsetOfDuration = (
	prevStartFrom: number,
	newStartFrom: number,
	prevDuration: number,
	newDuration: number,
) => {
	return (
		prevStartFrom <= newStartFrom &&
		prevStartFrom + prevDuration >= newStartFrom + newDuration
	);
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

	if (!isSubsetOfDuration || initialActualSrc !== actualSrc.current) {
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
