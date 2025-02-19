import React, {useContext, useEffect, useRef, useState} from 'react';
import {Internals} from 'remotion';
import {checkFullscreenSupport} from '../helpers/check-fullscreen-support';
import {BACKGROUND, BACKGROUND__TRANSPARENT} from '../helpers/colors';
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
import {LoopToggle} from './LoopToggle';
import {MuteToggle} from './MuteToggle';
import {PlayPause} from './PlayPause';
import {PlaybackKeyboardShortcutsManager} from './PlaybackKeyboardShortcutsManager';
import {PlaybackRatePersistor} from './PlaybackRatePersistor';
import {PlaybackRateSelector} from './PlaybackRateSelector';
import {RenderButton} from './RenderButton';
import {SizeSelector} from './SizeSelector';
import {TimelineZoomControls} from './Timeline/TimelineZoomControls';
import {TimelineInOutPointToggle} from './TimelineInOutToggle';
import {Flex, Spacing} from './layout';

const container: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'center',
	borderTop: '1px solid rgba(0, 0, 0, 0.5)',
	paddingTop: 2,
	paddingBottom: 2,
	alignItems: 'center',
	flexDirection: 'row',
	background: BACKGROUND,
};

const mobileContainer: React.CSSProperties = {
	...container,
	position: 'relative',
	overflowY: 'auto',
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
	height: 38,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
};

const padding: React.CSSProperties = {
	width: TIMELINE_PADDING,
};

export const PreviewToolbar: React.FC<{
	readonly readOnlyStudio: boolean;
	readonly bufferStateDelayInMilliseconds: number;
}> = ({readOnlyStudio, bufferStateDelayInMilliseconds}) => {
	const {playbackRate, setPlaybackRate} = useContext(
		Internals.Timeline.TimelineContext,
	);

	const {mediaMuted} = useContext(Internals.MediaVolumeContext);
	const {setMediaMuted} = useContext(Internals.SetMediaVolumeContext);
	const isVideoComposition = useIsVideoComposition();
	const previewToolbarRef = useRef<HTMLDivElement | null>(null);
	const leftScrollIndicatorRef = useRef<HTMLDivElement | null>(null);
	const rightScrollIndicatorRef = useRef<HTMLDivElement | null>(null);

	const isStill = useIsStill();

	const [loop, setLoop] = useState(loadLoopOption());

	const isFullscreenSupported = checkFullscreenSupport();

	const isMobileLayout = useMobileLayout();

	useEffect(() => {
		if (isMobileLayout && previewToolbarRef.current) {
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
						<TimelineZoomControls />
					</div>
					<Flex />
					<SizeSelector />
					{isStill || isVideoComposition ? (
						<PlaybackRateSelector
							setPlaybackRate={setPlaybackRate}
							playbackRate={playbackRate}
						/>
					) : null}
				</>
			)}

			{isVideoComposition ? (
				<>
					<Spacing x={2} />
					<PlayPause
						bufferStateDelayInMilliseconds={bufferStateDelayInMilliseconds}
						loop={loop}
						playbackRate={playbackRate}
					/>
					<Spacing x={2} />
					<LoopToggle loop={loop} setLoop={setLoop} />
					<MuteToggle muted={mediaMuted} setMuted={setMediaMuted} />
					<Spacing x={2} />
					<TimelineInOutPointToggle />
					<Spacing x={2} />
				</>
			) : null}

			<CheckboardToggle />
			<Spacing x={1} />
			{isFullscreenSupported && <FullScreenToggle />}
			<Flex />
			{isMobileLayout && (
				<>
					<Flex />
					<SizeSelector />
					{isStill || isVideoComposition ? (
						<PlaybackRateSelector
							setPlaybackRate={setPlaybackRate}
							playbackRate={playbackRate}
						/>
					) : null}
				</>
			)}
			<div style={sideContainer}>
				<Flex />
				{!isMobileLayout && <FpsCounter playbackSpeed={playbackRate} />}
				<Spacing x={2} />
				{readOnlyStudio ? null : <RenderButton />}
				<Spacing x={1.5} />
			</div>
			<PlaybackKeyboardShortcutsManager setPlaybackRate={setPlaybackRate} />
			<PlaybackRatePersistor />
			<div ref={rightScrollIndicatorRef} style={scrollIndicatorRight} />
		</div>
	);
};
