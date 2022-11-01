import type {
	ComponentType,
	CSSProperties,
	LazyExoticComponent,
	MutableRefObject,
} from 'react';
import {
	forwardRef,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {CompProps, TimelineContextValue} from 'remotion';
import {Internals, random} from 'remotion';
import {ThumbnailEmitterContext} from './emitter-context';
import {ThumbnailEmitter} from './event-emitter';
import type {ThumbnailMethods} from './player-methods';
import type {ErrorFallback, RenderLoading} from './PlayerUI';
import {SharedPlayerContexts} from './SharedPlayerContext';
import ThumbnailUI from './ThumbnailUI';
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
		errorFallback?: ErrorFallback;
		renderLoading?: RenderLoading;
		className?: string;
	};

export const ThumbnailFn = <T,>(
	{
		frameToDisplay,
		style,
		inputProps,
		compositionHeight,
		compositionWidth,
		durationInFrames,
		fps,
		className,
		errorFallback = () => '⚠️',
		renderLoading,
		...componentProps
	}: ThumbnailProps<T>,
	ref: MutableRefObject<ThumbnailMethods>
) => {
	const [thumbnailId] = useState(() => String(random(null)));
	const rootRef = useRef<ThumbnailMethods>(null);

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

	useImperativeHandle(ref, () => rootRef.current as ThumbnailMethods, []);

	const Component = Internals.useLazyComponent(
		componentProps
	) as LazyExoticComponent<ComponentType<unknown>>;

	const [emitter] = useState(() => new ThumbnailEmitter());

	const passedInputProps = useMemo(() => {
		return inputProps ?? {};
	}, [inputProps]);

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
			<ThumbnailEmitterContext.Provider value={emitter}>
				<ThumbnailUI
					className={className}
					errorFallback={errorFallback}
					inputProps={passedInputProps}
					renderLoading={renderLoading}
					style={style}
				/>
			</ThumbnailEmitterContext.Provider>
		</SharedPlayerContexts>
	);
};

declare module 'react' {
	// eslint-disable-next-line @typescript-eslint/no-shadow
	function forwardRef<T, P = {}>(
		render: (
			props: P,
			ref: React.MutableRefObject<T>
		) => React.ReactElement | null
	): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
}

export const Thumbnail = forwardRef(ThumbnailFn);
