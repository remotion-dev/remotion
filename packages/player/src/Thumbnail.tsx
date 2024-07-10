import type {
	ComponentType,
	CSSProperties,
	LazyExoticComponent,
	MutableRefObject,
} from 'react';
import {
	forwardRef,
	useImperativeHandle,
	useLayoutEffect,
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
import {PLAYER_COMP_ID, SharedPlayerContexts} from './SharedPlayerContext.js';
import ThumbnailUI from './ThumbnailUI.js';
import type {PropsIfHasProps} from './utils/props-if-has-props.js';

export type ThumbnailProps<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = PropsIfHasProps<Schema, Props> &
	CompProps<Props> & {
		readonly frameToDisplay: number;
		readonly style?: CSSProperties;
		readonly durationInFrames: number;
		readonly compositionWidth: number;
		readonly compositionHeight: number;
		readonly fps: number;
		readonly overflowVisible?: boolean;
		readonly errorFallback?: ErrorFallback;
		readonly renderLoading?: RenderLoading;
		readonly className?: string;
	};

export type ThumbnailPropsWithoutZod<Props extends Record<string, unknown>> =
	ThumbnailProps<AnyZodObject, Props>;

const ThumbnailFn = <
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
>(
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
		overflowVisible = false,
		...componentProps
	}: ThumbnailProps<Schema, Props>,
	ref: MutableRefObject<ThumbnailMethods>,
) => {
	if (typeof window !== 'undefined') {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useLayoutEffect(() => {
			window.remotion_isPlayer = true;
		}, []);
	}

	const [thumbnailId] = useState(() => String(random(null)));
	const rootRef = useRef<ThumbnailMethods>(null);

	const timelineState: TimelineContextValue = useMemo(() => {
		const value: TimelineContextValue = {
			playing: false,
			frame: {
				[PLAYER_COMP_ID]: frameToDisplay,
			},
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

		return value;
	}, [frameToDisplay, thumbnailId]);

	useImperativeHandle(ref, () => rootRef.current as ThumbnailMethods, []);

	const Component = Internals.useLazyComponent(
		componentProps,
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
				numberOfSharedAudioTags={0}
				initiallyMuted
			>
				<ThumbnailEmitterContext.Provider value={emitter}>
					<ThumbnailUI
						ref={rootRef}
						className={className}
						errorFallback={errorFallback}
						inputProps={passedInputProps}
						renderLoading={renderLoading}
						style={style}
						overflowVisible={overflowVisible}
					/>
				</ThumbnailEmitterContext.Provider>
			</SharedPlayerContexts>
		</Internals.IsPlayerContextProvider>
	);
};

const forward = forwardRef as <T, P = {}>(
	render: (
		props: P,
		ref: React.MutableRefObject<T>,
	) => React.ReactElement | null,
) => (props: P & React.RefAttributes<T>) => React.ReactElement | null;

/**
 * @description A component which can be rendered in a regular React App (for example: Next.js, Vite) to display a single frame of a video.
 * @see [Documentation](https://www.remotion.dev/docs/player/thumbnail)
 */

export const Thumbnail = forward(ThumbnailFn);
