import {useEffect, useRef} from 'react';

type OnDuration = (src: string, durationInSeconds: number) => void;

const subscribeToMediaDuration = (
	mediaRef: React.RefObject<HTMLMediaElement | null>,
	onDurationRef: React.RefObject<OnDuration>,
	src: string | null,
) => {
	const {current} = mediaRef;
	if (!current) {
		return;
	}

	if (current.duration) {
		onDurationRef.current?.(src ?? current.src, current.duration);
		return;
	}

	const onLoadedMetadata = () => {
		onDurationRef.current?.(src ?? current.src, current.duration);
	};

	current.addEventListener('loadedmetadata', onLoadedMetadata);
	return () => {
		current.removeEventListener('loadedmetadata', onLoadedMetadata);
	};
};

export const useMediaDuration = (
	mediaRef: React.RefObject<HTMLMediaElement | null>,
	onDuration: OnDuration,
	src: string,
	useCurrentSrc: boolean,
) => {
	const onDurationRef = useRef(onDuration);
	onDurationRef.current = onDuration;

	// The listener and its cleanup must not share the component render scope.
	// Binding prevents production minifiers from inlining that scope back in.
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(
		subscribeToMediaDuration.bind(
			null,
			mediaRef,
			onDurationRef,
			useCurrentSrc ? null : src,
		),
		[mediaRef, src, useCurrentSrc],
	);
};

export const scheduleMediaSourceCleanup = (cleanup: (() => void) | null) => {
	requestAnimationFrame(() => cleanup?.());
};
