import React, {useCallback, useEffect} from 'react';
import type {Player} from '../play-video';

export const PlayingIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 320 512"
			fill="currentColor"
			{...props}
		>
			<path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z" />
		</svg>
	);
};

export const PausedIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			aria-hidden="true"
			focusable="false"
			data-prefix="fas"
			data-icon="play"
			className="svg-inline--fa fa-play fa-w-14"
			role="img"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 448 512"
			{...props}
		>
			<path
				fill="currentColor"
				d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"
			/>
		</svg>
	);
};

const playerButtonStyle: React.CSSProperties = {
	appearance: 'none',
	border: 'none',
	borderRadius: 0,
	background: 'none',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	paddingRight: 14,
	paddingLeft: 14,
	borderRight: '2px solid black',
	cursor: 'pointer',
	height: 50,
	color: 'black',
};

export const PlayPauseButton: React.FC<{
	readonly player: Player;
}> = ({player}) => {
	const [playing, setPlaying] = React.useState(() => player.isPlaying());

	useEffect(() => {
		const onPlay = () => {
			setPlaying(true);
		};

		const onPause = () => {
			setPlaying(false);
		};

		player.addEventListener('play', onPlay);
		player.addEventListener('pause', onPause);

		return () => {
			player.removeEventListener('play', onPlay);
			player.removeEventListener('pause', onPause);
		};
	}, [player]);

	const onToggle = useCallback(() => {
		if (playing) {
			player.pause();
		} else {
			player.play();
		}
	}, [player, playing]);

	const playPauseIconStyle: React.CSSProperties = {
		width: 15,
	};

	return (
		<button type="button" style={playerButtonStyle} onClick={onToggle}>
			{playing ? (
				<PlayingIcon style={playPauseIconStyle} />
			) : (
				<PausedIcon style={playPauseIconStyle} />
			)}
		</button>
	);
};
