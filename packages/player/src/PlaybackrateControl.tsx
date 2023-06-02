import React, {useCallback, useContext} from 'react';
import {Internals} from 'remotion';
import {SettingsIcon} from './icons.js';
import useComponentVisible from './utils/use-component-visible.js';

const PlaybackPopup: React.FC<{
	setIsComponentVisible: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({setIsComponentVisible}) => {
	const PLAYBACK_RATES = [0.5, 0.8, 1, 1.2, 1.5, 1.8, 2, 2.5, 3, 3.5];

	const {setPlaybackRate} = useContext(Internals.Timeline.TimelineContext);

	const playbackPopup: React.CSSProperties = {
		position: 'absolute',
		left: 0,
		width: 125,
		bottom: 35,
		background: 'rgb(0 0 0 / 50%)',
		borderRadius: 8,
		color: '#fff',
		textAlign: 'left',
		backdropFilter: 'blur(10px)',
		zIndex: 100,
	};

	const rateDiv: React.CSSProperties = {
		height: 30,
		lineHeight: '30px',
		padding: '0 15px',
	};

	const speedText: React.CSSProperties = {
		fontWeight: '700',
		padding: '15px 15px 0 15px',
		cursor: 'default',
	};

	return (
		<div style={playbackPopup}>
			<div style={speedText}>Change speed</div>
			{PLAYBACK_RATES.map((rate) => {
				return (
					<div
						key={rate}
						style={rateDiv}
						onPointerUp={(e) => {
							e.stopPropagation();
							e.preventDefault();
							setPlaybackRate(rate);
							setIsComponentVisible(false);
						}}
					>
						{rate}
					</div>
				);
			})}
		</div>
	);
};

const playbackButton: React.CSSProperties = {
	position: 'relative',
	display: 'inline-flex',
	alignItems: 'center',
	padding: '6px 0 6px 0',
	border: 'none',
	background: 'none',
	height: 36,
	cursor: 'pointer',
};

export const PlaybackrateControl = () => {
	const {ref, isComponentVisible, setIsComponentVisible} =
		useComponentVisible(false);

	const onClick: React.MouseEventHandler<HTMLButtonElement> = useCallback(
		(e) => {
			e.stopPropagation();
			e.preventDefault();
			setIsComponentVisible(!isComponentVisible);
		},
		[isComponentVisible, setIsComponentVisible]
	);

	return (
		<div ref={ref}>
			<button
				type="button"
				aria-label="Change playback rate"
				style={playbackButton}
				onClick={onClick}
			>
				<SettingsIcon iconSize={22} />
				{isComponentVisible && (
					<PlaybackPopup setIsComponentVisible={setIsComponentVisible} />
				)}
			</button>
		</div>
	);
};
