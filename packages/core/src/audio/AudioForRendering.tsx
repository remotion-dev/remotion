import type {ForwardRefExoticComponent, RefAttributes} from 'react';
import React, {
	forwardRef,
	useContext,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useMemo,
	useRef,
} from 'react';
import {RenderAssetManager} from '../RenderAssetManager.js';
import {SequenceContext} from '../SequenceContext.js';
import {getAbsoluteSrc} from '../absolute-src.js';
import {continueRender, delayRender} from '../delay-render.js';
import {random} from '../random.js';
import {useTimelinePosition} from '../timeline-position-state.js';
import {useCurrentFrame} from '../use-current-frame.js';
import {evaluateVolume} from '../volume-prop.js';
import type {RemotionAudioProps} from './props.js';
import {useFrameForVolumeProp} from './use-audio-frame.js';

type AudioForRenderingProps = RemotionAudioProps & {
	onDuration: (src: string, durationInSeconds: number) => void;
};

const AudioForRenderingRefForwardingFunction: React.ForwardRefRenderFunction<
	HTMLAudioElement,
	AudioForRenderingProps
> = (props, ref) => {
	const audioRef = useRef<HTMLAudioElement>(null);

	const absoluteFrame = useTimelinePosition();
	const volumePropFrame = useFrameForVolumeProp();
	const frame = useCurrentFrame();
	const sequenceContext = useContext(SequenceContext);
	const {registerRenderAsset, unregisterRenderAsset} =
		useContext(RenderAssetManager);

	// Generate a string that's as unique as possible for this asset
	// but at the same time the same on all threads
	const id = useMemo(
		() =>
			`audio-${random(
				props.src ?? '',
			)}-${sequenceContext?.relativeFrom}-${sequenceContext?.cumulatedFrom}-${sequenceContext?.durationInFrames}`,
		[
			props.src,
			sequenceContext?.relativeFrom,
			sequenceContext?.cumulatedFrom,
			sequenceContext?.durationInFrames,
		],
	);

	const {
		volume: volumeProp,
		playbackRate,
		allowAmplificationDuringRender,
		onDuration,
		toneFrequency,
		_remotionInternalNeedsDurationCalculation,
		_remotionInternalNativeLoopPassed,
		acceptableTimeShiftInSeconds,
		name,
		onError,
		...nativeProps
	} = props;

	const volume = evaluateVolume({
		volume: volumeProp,
		frame: volumePropFrame,
		mediaVolume: 1,
		allowAmplificationDuringRender: allowAmplificationDuringRender ?? false,
	});

	useImperativeHandle(
		ref,
		() => {
			return audioRef.current as HTMLVideoElement;
		},
		[],
	);

	useEffect(() => {
		if (!props.src) {
			throw new Error('No src passed');
		}

		if (!window.remotion_audioEnabled) {
			return;
		}

		if (props.muted) {
			return;
		}

		if (volume <= 0) {
			return;
		}

		registerRenderAsset({
			type: 'audio',
			src: getAbsoluteSrc(props.src),
			id,
			frame: absoluteFrame,
			volume,
			mediaFrame: frame,
			playbackRate: props.playbackRate ?? 1,
			allowAmplificationDuringRender: allowAmplificationDuringRender ?? false,
			toneFrequency: toneFrequency ?? null,
		});
		return () => unregisterRenderAsset(id);
	}, [
		props.muted,
		props.src,
		registerRenderAsset,
		absoluteFrame,
		id,
		unregisterRenderAsset,
		volume,
		volumePropFrame,
		frame,
		playbackRate,
		props.playbackRate,
		allowAmplificationDuringRender,
		toneFrequency,
	]);

	const {src} = props;

	// The <audio> tag is only rendered if the duration needs to be calculated for the `loop`
	// attribute to work, or if the user assigns a ref to it.
	const needsToRenderAudioTag =
		ref || _remotionInternalNeedsDurationCalculation;

	// If audio source switches, make new handle
	useLayoutEffect(() => {
		if (process.env.NODE_ENV === 'test') {
			return;
		}

		if (!needsToRenderAudioTag) {
			return;
		}

		const newHandle = delayRender('Loading <Audio> duration with src=' + src);
		const {current} = audioRef;

		const didLoad = () => {
			if (current?.duration) {
				onDuration(current.src as string, current.duration);
			}

			continueRender(newHandle);
		};

		if (current?.duration) {
			onDuration(current.src as string, current.duration);
			continueRender(newHandle);
		} else {
			current?.addEventListener('loadedmetadata', didLoad, {once: true});
		}

		// If tag gets unmounted, clear pending handles because video metadata is not going to load
		return () => {
			current?.removeEventListener('loadedmetadata', didLoad);
			continueRender(newHandle);
		};
	}, [src, onDuration, needsToRenderAudioTag]);

	if (!needsToRenderAudioTag) {
		return null;
	}

	return <audio ref={audioRef} {...nativeProps} />;
};

export const AudioForRendering = forwardRef(
	AudioForRenderingRefForwardingFunction,
) as ForwardRefExoticComponent<
	AudioForRenderingProps & RefAttributes<HTMLAudioElement>
>;
