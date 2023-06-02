import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {SettingsIcon} from './icons.js';
import useComponentVisible from './utils/use-component-visible.js';

const playbackPopup: React.CSSProperties = {
	position: 'absolute',
	right: 0,
	width: 125,
	bottom: 35,
	background: '#fff',
	borderRadius: 4,
	overflow: 'hidden',
	color: 'black',
	textAlign: 'left',
};

const rateDiv: React.CSSProperties = {
	height: 30,
	paddingRight: 15,
	paddingLeft: 12,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
};

const checkmarkContainer: React.CSSProperties = {
	width: 22,
	display: 'flex',
	alignItems: 'center',
};

const checkmarkStyle: React.CSSProperties = {
	width: 14,
	height: 14,
	color: 'black',
};

export const Checkmark = () => (
	<svg viewBox="0 0 512 512" style={checkmarkStyle}>
		<path
			fill="currentColor"
			d="M435.848 83.466L172.804 346.51l-96.652-96.652c-4.686-4.686-12.284-4.686-16.971 0l-28.284 28.284c-4.686 4.686-4.686 12.284 0 16.971l133.421 133.421c4.686 4.686 12.284 4.686 16.971 0l299.813-299.813c4.686-4.686 4.686-12.284 0-16.971l-28.284-28.284c-4.686-4.686-12.284-4.686-16.97 0z"
		/>
	</svg>
);

const PlaybackPopup: React.FC<{
	setIsComponentVisible: React.Dispatch<React.SetStateAction<boolean>>;
	playbackRates: number[];
}> = ({setIsComponentVisible, playbackRates}) => {
	const {setPlaybackRate, playbackRate} = useContext(
		Internals.Timeline.TimelineContext
	);

	const [keyboardSelectedRate, setKeyboardSelectedRate] =
		useState<number>(playbackRate);

	useEffect(() => {
		const listener = (e: KeyboardEvent) => {
			e.preventDefault();
			if (e.key === 'ArrowUp') {
				const currentIndex = playbackRates.findIndex(
					(rate) => rate === keyboardSelectedRate
				);
				if (currentIndex === 0) {
					return;
				}

				if (currentIndex === -1) {
					setKeyboardSelectedRate(playbackRates[0]);
				} else {
					setKeyboardSelectedRate(playbackRates[currentIndex - 1]);
				}
			} else if (e.key === 'ArrowDown') {
				const currentIndex = playbackRates.findIndex(
					(rate) => rate === keyboardSelectedRate
				);
				if (currentIndex === playbackRates.length - 1) {
					return;
				}

				if (currentIndex === -1) {
					setKeyboardSelectedRate(playbackRates[playbackRates.length - 1]);
				} else {
					setKeyboardSelectedRate(playbackRates[currentIndex + 1]);
				}
			} else if (e.key === 'Enter') {
				setPlaybackRate(keyboardSelectedRate);
				setIsComponentVisible(false);
			}
		};

		window.addEventListener('keydown', listener);

		return () => {
			window.removeEventListener('keydown', listener);
		};
	}, [
		playbackRates,
		keyboardSelectedRate,
		setPlaybackRate,
		setIsComponentVisible,
	]);

	const onSelect = useCallback(
		(rate: number) => {
			setPlaybackRate(rate);
			setIsComponentVisible(false);
		},
		[setIsComponentVisible, setPlaybackRate]
	);

	return (
		<div style={playbackPopup}>
			{playbackRates.map((rate) => {
				return (
					<PlaybackrateOption
						key={rate}
						selectedRate={playbackRate}
						onSelect={onSelect}
						rate={rate}
						keyboardSelectedRate={keyboardSelectedRate}
					/>
				);
			})}
		</div>
	);
};

const PlaybackrateOption: React.FC<{
	rate: number;
	selectedRate: number;
	onSelect: (rate: number) => void;
	keyboardSelectedRate: number;
}> = ({rate, onSelect, selectedRate, keyboardSelectedRate}) => {
	const onClick: React.MouseEventHandler<HTMLDivElement> = useCallback(
		(e) => {
			e.stopPropagation();
			e.preventDefault();
			onSelect(rate);
		},
		[onSelect, rate]
	);

	const [hovered, setHovered] = useState(false);

	const onMouseEnter: React.MouseEventHandler<HTMLDivElement> =
		useCallback(() => {
			setHovered(true);
		}, []);

	const onMouseLeave: React.MouseEventHandler<HTMLDivElement> =
		useCallback(() => {
			setHovered(false);
		}, []);

	const actualStyle = useMemo(() => {
		return {
			...rateDiv,
			backgroundColor:
				hovered || keyboardSelectedRate === rate ? '#eee' : 'transparent',
		};
	}, [hovered, keyboardSelectedRate, rate]);

	return (
		<div
			key={rate}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			tabIndex={0}
			style={actualStyle}
			onClick={onClick}
		>
			<div style={checkmarkContainer}>
				{rate === selectedRate ? <Checkmark /> : null}
			</div>
			{rate.toFixed(1)}x
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

export const PlaybackrateControl: React.FC<{
	playbackRates: number[];
}> = ({playbackRates}) => {
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
					<PlaybackPopup
						playbackRates={playbackRates}
						setIsComponentVisible={setIsComponentVisible}
					/>
				)}
			</button>
		</div>
	);
};
