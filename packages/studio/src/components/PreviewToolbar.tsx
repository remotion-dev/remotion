import React, {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {checkFullscreenSupport} from '../helpers/check-fullscreen-support';
import {
	BACKGROUND,
	BACKGROUND__TRANSPARENT,
	BORDER_BLACK_ALPHA_50,
} from '../helpers/colors';
import {
	useIsStill,
	useIsVideoComposition,
} from '../helpers/is-current-selected-still';
import {useMobileLayout} from '../helpers/mobile-layout';
import {TIMELINE_PADDING} from '../helpers/timeline-layout';
import {loadLoopOption} from '../state/loop';
import {CheckboardToggle} from './CheckboardToggle';
import {FpsCounter} from './FpsCounter';
import {FullScreenToggle} from './FullscreenToggle';
import {Flex, Spacing} from './layout';
import {LoopToggle} from './LoopToggle';
import {MuteToggle} from './MuteToggle';
import {OutlineToggle} from './OutlineToggle';
import {PlaybackKeyboardShortcutsManager} from './PlaybackKeyboardShortcutsManager';
import {PlaybackRatePersistor} from './PlaybackRatePersistor';
import {PlaybackRateSelector} from './PlaybackRateSelector';
import {PlayPause} from './PlayPause';
import {RenderButton} from './RenderButton';
import {SizeSelector} from './SizeSelector';
import {SnappingToggle} from './SnappingToggle';
import {TimelineZoomControls} from './Timeline/TimelineZoomControls';
import {TimelineInOutPointToggle} from './TimelineInOutToggle';

const TOOLBAR_HEIGHT = 40;

const container: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'center',
	borderTop: BORDER_BLACK_ALPHA_50,
	alignItems: 'center',
	flexDirection: 'row',
	background: BACKGROUND,
	height: TOOLBAR_HEIGHT,
};

const mobileContainer: React.CSSProperties = {
	...container,
	position: 'relative',
	overflowX: 'auto',
	justifyContent: 'flex-start',
};
const scrollIndicatorLeft: React.CSSProperties = {
	position: 'fixed',
	display: 'none',
	top: 0,
	left: 0,
	width: 40,
	height: '100%',
	pointerEvents: 'none',
	background: `linear-gradient(to right, ${BACKGROUND}, ${BACKGROUND__TRANSPARENT})`,
};

const scrollIndicatorRight: React.CSSProperties = {
	position: 'fixed',
	display: 'none',
	top: 0,
	right: 0,
	width: 40,
	height: '100%',
	pointerEvents: 'none',
	background: `linear-gradient(to left, ${BACKGROUND}, ${BACKGROUND__TRANSPARENT})`,
};

const sideContainer: React.CSSProperties = {
	width: 300,
	height: 30,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
};

const mobileSideContainer: React.CSSProperties = {
	height: 30,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	flexShrink: 0,
};

const padding: React.CSSProperties = {
	width: TIMELINE_PADDING,
};

const toolbarControl: React.CSSProperties = {
	display: 'contents',
};

const PreviewToolbarControl: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
		// Prevent deselection of currently selected items
		e.stopPropagation();
	}, []);

	return (
		<div style={toolbarControl} onPointerDown={onPointerDown}>
			{children}
		</div>
	);
};

export const PreviewToolbar: React.FC<{
	readonly readOnlyStudio: boolean;
	readonly bufferStateDelayInMilliseconds: number;
}> = ({readOnlyStudio, bufferStateDelayInMilliseconds}) => {
	const {playbackRate, setPlaybackRate} = Internals.usePlaybackRate();

	const {playerMuted} = useContext(Internals.MediaVolumeContext);
	const {setPlayerMuted} = useContext(Internals.SetMediaVolumeContext);
	const {canvasContent} = useContext(Internals.CompositionManager);
	const isVideoComposition = useIsVideoComposition();
	const previewToolbarRef = useRef<HTMLDivElement | null>(null);
	const leftScrollIndicatorRef = useRef<HTMLDivElement | null>(null);
	const rightScrollIndicatorRef = useRef<HTMLDivElement | null>(null);

	const isStill = useIsStill();

	const [loop, setLoop] = useState(loadLoopOption());

	const isFullscreenSupported = checkFullscreenSupport();

	const isMobileLayout = useMobileLayout();

	useEffect(() => {
		if (!isMobileLayout) {
			// The indicators are `position: fixed` and are shown/placed
			// imperatively by the scroll handler below. Without this reset,
			// leaving the mobile layout (window resized past the breakpoint)
			// leaves them visible at stale viewport coordinates — an orphaned
			// grey gradient rectangle floating over the canvas.
			if (leftScrollIndicatorRef.current) {
				leftScrollIndicatorRef.current.style.display = 'none';
			}

			if (rightScrollIndicatorRef.current) {
				rightScrollIndicatorRef.current.style.display = 'none';
			}

			return;
		}

		if (previewToolbarRef.current) {
			const updateScrollableIndicatorProps = (target: HTMLDivElement) => {
				const boundingBox = target.getBoundingClientRect();
				const {scrollLeft, scrollWidth, clientWidth} = target;
				const scrollRight = scrollWidth - clientWidth - scrollLeft;
				if (
					!leftScrollIndicatorRef.current ||
					!rightScrollIndicatorRef.current
				) {
					return;
				}

				if (scrollLeft !== 0) {
					Object.assign(leftScrollIndicatorRef.current.style, {
						display: 'block',
						height: `${boundingBox.height}px`,
						top: `${boundingBox.top}px`,
						left: `${boundingBox.left}px`,
					});
				} else {
					Object.assign(leftScrollIndicatorRef.current.style, {
						display: 'none',
					});
				}

				if (scrollRight !== 0) {
					const itemWidth = rightScrollIndicatorRef.current?.clientWidth || 0;
					Object.assign(rightScrollIndicatorRef.current.style, {
						display: 'block',
						height: `${boundingBox.height}px`,
						top: `${boundingBox.top}px`,
						left: `${boundingBox.left + boundingBox.width - itemWidth}px`,
					});
				} else {
					Object.assign(rightScrollIndicatorRef.current.style, {
						display: 'none',
					});
				}
			};

			const previewToolbar = previewToolbarRef.current;
			const scrollHandler = () => {
				updateScrollableIndicatorProps(previewToolbar);
			};

			previewToolbar.addEventListener('scroll', scrollHandler);
			scrollHandler();
			return () => {
				previewToolbar.removeEventListener('scroll', scrollHandler);
			};
		}
	});

	return (
		<div
			ref={previewToolbarRef}
			style={isMobileLayout ? mobileContainer : container}
			className="css-reset"
		>
			<div ref={leftScrollIndicatorRef} style={scrollIndicatorLeft} />
			{isMobileLayout ? null : (
				<>
					<div style={sideContainer}>
						<div style={padding} />
						<PreviewToolbarControl>
							<TimelineZoomControls />
						</PreviewToolbarControl>
					</div>
					<Flex />
					<PreviewToolbarControl>
						<SizeSelector />
					</PreviewToolbarControl>
					{isStill || isVideoComposition ? (
						<PreviewToolbarControl>
							<PlaybackRateSelector
								setPlaybackRate={setPlaybackRate}
								playbackRate={playbackRate}
							/>
						</PreviewToolbarControl>
					) : null}
				</>
			)}

			{isVideoComposition ? (
				<>
					<Spacing x={2} />
					<PreviewToolbarControl>
						<PlayPause
							bufferStateDelayInMilliseconds={bufferStateDelayInMilliseconds}
							loop={loop}
							playbackRate={playbackRate}
							muted={playerMuted}
						/>
					</PreviewToolbarControl>
					<Spacing x={2} />
					<PreviewToolbarControl>
						<LoopToggle loop={loop} setLoop={setLoop} />
					</PreviewToolbarControl>
					<PreviewToolbarControl>
						<MuteToggle muted={playerMuted} setMuted={setPlayerMuted} />
					</PreviewToolbarControl>
					<Spacing x={2} />
					<PreviewToolbarControl>
						<TimelineInOutPointToggle />
					</PreviewToolbarControl>
					<Spacing x={2} />
				</>
			) : null}
			{canvasContent?.type === 'composition' ? (
				<>
					<PreviewToolbarControl>
						<CheckboardToggle />
					</PreviewToolbarControl>
					<PreviewToolbarControl>
						<OutlineToggle disabled={readOnlyStudio} />
					</PreviewToolbarControl>
					<PreviewToolbarControl>
						<SnappingToggle disabled={readOnlyStudio} />
					</PreviewToolbarControl>
				</>
			) : null}
			<Spacing x={1} />
			{canvasContent && isFullscreenSupported ? (
				<PreviewToolbarControl>
					<FullScreenToggle />
				</PreviewToolbarControl>
			) : null}
			<Flex />
			{isMobileLayout && (
				<>
					<PreviewToolbarControl>
						<SizeSelector />
					</PreviewToolbarControl>
					{isStill || isVideoComposition ? (
						<PreviewToolbarControl>
							<PlaybackRateSelector
								setPlaybackRate={setPlaybackRate}
								playbackRate={playbackRate}
							/>
						</PreviewToolbarControl>
					) : null}
				</>
			)}
			<div style={isMobileLayout ? mobileSideContainer : sideContainer}>
				<Flex />
				{!isMobileLayout && <FpsCounter playbackSpeed={playbackRate} />}
				<Spacing x={2} />
				<PreviewToolbarControl>
					<RenderButton readOnlyStudio={readOnlyStudio} size="compact" />
				</PreviewToolbarControl>
				<Spacing x={1.5} />
			</div>
			<PlaybackKeyboardShortcutsManager setPlaybackRate={setPlaybackRate} />
			<PlaybackRatePersistor />
			<div ref={rightScrollIndicatorRef} style={scrollIndicatorRight} />
		</div>
	);
};
