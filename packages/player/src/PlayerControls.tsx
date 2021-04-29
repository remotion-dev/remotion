import {Internals} from 'remotion';
import {formatTime} from './format-time';
import {PlayerSeekBar} from './PlayerSeekBar';
import {usePlaybackTime} from './PlayPause';

export const Controls: React.FC<{
	fps: number;
	durationInFrames: number;
}> = ({durationInFrames, fps}) => {
	const {toggle} = usePlaybackTime();
	const [playing] = Internals.Timeline.usePlayingState();
	const frame = Internals.Timeline.useTimelinePosition();

	return (
		<div
			style={{
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
			}}
		>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					width: '100%',
					alignItems: 'center',
					userSelect: 'none',
				}}
			>
				<button type="button" onClick={toggle}>
					{playing ? 'pause' : 'play'}
				</button>
				<div style={{width: 10}} />
				<div
					style={{
						color: 'white',
						fontFamily: 'sans-serif',
						fontSize: 14,
					}}
				>
					{formatTime(frame / fps)} / {formatTime(durationInFrames / fps)}
				</div>
				<div style={{flex: 1}} />
			</div>
			<div style={{height: 8}} />
			<PlayerSeekBar durationInFrames={durationInFrames} fps={fps} />
		</div>
	);
};
