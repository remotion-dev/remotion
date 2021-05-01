import React, {useMemo} from 'react';
import {Internals} from 'remotion';
import {formatTime} from './format-time';
import {PauseIcon, PlayIcon} from './icons';
import {PlayerSeekBar} from './PlayerSeekBar';
import {usePlaybackTime} from './PlayPause';

const containerStyle: React.CSSProperties = {
	boxSizing: 'border-box',
	position: 'absolute',
	bottom: 0,
	width: '100%',
	paddingTop: 40,
	paddingBottom: 10,
	background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.4))',
	display: 'flex',
	paddingRight: 12,
	paddingLeft: 12,
	flexDirection: 'column',
	transition: 'opacity 0.3s',
};

const buttonStyle: React.CSSProperties = {
	appearance: 'none',
	backgroundColor: 'transparent',
	border: 'none',
	cursor: 'pointer',
	padding: 0,
	display: 'inline',
	marginBottom: 0,
	height: 25,
};

const controlsRow: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	width: '100%',
	alignItems: 'center',
	userSelect: 'none',
};

const xSpacer: React.CSSProperties = {
	width: 10,
};

const ySpacer: React.CSSProperties = {
	height: 8,
};

const timeLabel: React.CSSProperties = {
	color: 'white',
	fontFamily: 'sans-serif',
	fontSize: 14,
};

export const Controls: React.FC<{
	fps: number;
	durationInFrames: number;
	hovered: boolean;
}> = ({durationInFrames, hovered, fps}) => {
	const {toggle} = usePlaybackTime();
	const [playing] = Internals.Timeline.usePlayingState();
	const frame = Internals.Timeline.useTimelinePosition();

	const containerCss: React.CSSProperties = useMemo(() => {
		// Hide if playing and mouse outside
		const shouldShow = hovered || !playing;
		return {
			...containerStyle,
			opacity: Number(shouldShow),
		};
	}, [hovered, playing]);

	return (
		<div style={containerCss}>
			<div style={controlsRow}>
				<button
					type="button"
					style={buttonStyle}
					onClick={toggle}
					aria-label={playing ? 'Pause video' : 'Play video'}
					title={playing ? 'Pause video' : 'Play video'}
				>
					{playing ? <PauseIcon /> : <PlayIcon />}
				</button>
				<div style={xSpacer} />
				<div style={timeLabel}>
					{formatTime(frame / fps)} / {formatTime(durationInFrames / fps)}
				</div>
			</div>
			<div style={ySpacer} />
			<PlayerSeekBar durationInFrames={durationInFrames} />
		</div>
	);
};
