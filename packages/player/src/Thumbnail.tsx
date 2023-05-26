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
import type {AnyZodObject} from 'zod';
import {ThumbnailEmitterContext} from './emitter-context.js';
import {ThumbnailEmitter} from './event-emitter.js';
import type {ThumbnailMethods} from './player-methods.js';
import type {ErrorFallback, RenderLoading} from './PlayerUI.js';
import {SharedPlayerContexts} from './SharedPlayerContext.js';
import ThumbnailUI from './ThumbnailUI.js';
import type {PropsIfHasProps} from './utils/props-if-has-props.js';

type ThumbnailProps<Schema extends AnyZodObject, Props> = PropsIfHasProps<
	Schema,
	Props
> &
	CompProps<Schema> & {
		frameToDisplay: number;
		style?: CSSProperties;
		durationInFrames: number;
		compositionWidth: number;
		compositionHeight: number;
		fps: number;
		errorFallback?: ErrorFallback;
		renderLoading?: RenderLoading;
		className?: string;
	};

export const ThumbnailFn = <Schema extends AnyZodObject, Props>(
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
	}: ThumbnailProps<Schema, Props>,
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
		<Internals.IsPlayerContextProvider>
			<SharedPlayerContexts
				timelineContext={timelineState}
				component={Component}
				compositionHeight={compositionHeight}
				compositionWidth={compositionWidth}
				durationInFrames={durationInFrames}
				fps={fps}
				inputProps={passedInputProps}
				numberOfSharedAudioTags={0}
				initiallyMuted
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
		</Internals.IsPlayerContextProvider>
	);
};

const forward = forwardRef as <T, P = {}>(
	render: (
		props: P,
		ref: React.MutableRefObject<T>
	) => React.ReactElement | null
) => (props: P & React.RefAttributes<T>) => React.ReactElement | null;

/**
 * @description A component which can be rendered in a regular React App (for example: Create React App, Next.js) to display a single frame of a video.
 * @see [Documentation](https://www.remotion.dev/docs/player/thumbnail)
 */

export const Thumbnail = forward(ThumbnailFn);
