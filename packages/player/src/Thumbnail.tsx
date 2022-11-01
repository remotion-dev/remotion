import type {ComponentType, CSSProperties, LazyExoticComponent} from 'react';
import {Suspense, useMemo, useState} from 'react';
import type {CompProps, TimelineContextValue} from 'remotion';
import {Internals, random} from 'remotion';
import {SharedPlayerContexts} from './SharedPlayerContext';
import type {PropsIfHasProps} from './utils/props-if-has-props';

type ThumbnailProps<T> = PropsIfHasProps<T> &
	CompProps<T> & {
		frameToDisplay: number;
		style?: CSSProperties;
		durationInFrames: number;
		compositionWidth: number;
		compositionHeight: number;
		inputProps?: unknown;
		fps: number;
	};

export const Thumbnail = <T,>({
	frameToDisplay,
	style,
	inputProps,
	compositionHeight,
	compositionWidth,
	durationInFrames,
	fps,
	...componentProps
}: ThumbnailProps<T>) => {
	const [thumbnailId] = useState(() => String(random(null)));

	const container: CSSProperties = useMemo(() => {
		return {
			width: compositionWidth,
			height: compositionHeight,
			backgroundColor: 'rgba(0, 0, 0, 0.4)',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			position: 'relative',
			...style,
		};
	}, [compositionWidth, compositionHeight, style]);

	const timelineState: TimelineContextValue = useMemo(() => {
		return {
			playing: false,
			frame: frameToDisplay,
			rootId: thumbnailId,
			imperativePlaying: {
				current: false,
			},
			playbackRate: 1,
			setPlaybackRate: () => {
				throw new Error('thumbnail');
			},
			audioAndVideoTags: {current: []},
		};
	}, [frameToDisplay, thumbnailId]);

	const props = useMemo(() => {
		return (inputProps ?? {}) as unknown as {};
	}, [inputProps]);

	const Component = Internals.useLazyComponent(
		componentProps
	) as LazyExoticComponent<ComponentType<unknown>>;

	return (
		<SharedPlayerContexts
			timelineContext={timelineState}
			component={Component}
			compositionHeight={compositionHeight}
			compositionWidth={compositionWidth}
			durationInFrames={durationInFrames}
			fps={fps}
			inputProps={inputProps}
			numberOfSharedAudioTags={0}
		>
			<div style={container}>
				<Suspense fallback={null}>
					<Component {...props} />
				</Suspense>
			</div>
		</SharedPlayerContexts>
	);
};
