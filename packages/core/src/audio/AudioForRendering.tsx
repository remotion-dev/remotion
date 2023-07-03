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
import {getAbsoluteSrc} from '../absolute-src.js';
import {AssetManager} from '../AssetManager.js';
import {continueRender, delayRender} from '../delay-render.js';
import {useRemotionEnvironment} from '../get-environment.js';
import {random} from '../random.js';
import {SequenceContext} from '../SequenceContext.js';
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
	const {registerAsset, unregisterAsset} = useContext(AssetManager);
	const environment = useRemotionEnvironment();

	// Generate a string that's as unique as possible for this asset
	// but at the same time the same on all threads
	const id = useMemo(
		() =>
			`audio-${random(props.src ?? '')}-${sequenceContext?.relativeFrom}-${
				sequenceContext?.cumulatedFrom
			}-${sequenceContext?.durationInFrames}`,
		[props.src, sequenceContext]
	);

	const {
		volume: volumeProp,
		playbackRate,
		allowAmplificationDuringRender,
		onDuration,
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
		[]
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

		registerAsset({
			type: 'audio',
			src: getAbsoluteSrc(props.src),
			id,
			frame: absoluteFrame,
			volume,
			mediaFrame: frame,
			playbackRate: props.playbackRate ?? 1,
			allowAmplificationDuringRender: allowAmplificationDuringRender ?? false,
		});
		return () => unregisterAsset(id);
	}, [
		props.muted,
		props.src,
		registerAsset,
		absoluteFrame,
		id,
		unregisterAsset,
		volume,
		volumePropFrame,
		frame,
		playbackRate,
		props.playbackRate,
		allowAmplificationDuringRender,
	]);

	const {src} = props;

	// If audio source switches, make new handle
	if (environment === 'rendering') {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useLayoutEffect(() => {
			if (process.env.NODE_ENV === 'test') {
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
		}, [src, onDuration]);
	}

	return <audio ref={audioRef} {...nativeProps} />;
};

export const AudioForRendering = forwardRef(
	AudioForRenderingRefForwardingFunction
) as ForwardRefExoticComponent<
	AudioForRenderingProps & RefAttributes<HTMLAudioElement>
>;
