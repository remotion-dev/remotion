import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {Internals} from 'remotion';
import useComponentVisible from './utils/use-component-visible.js';
import type {Size} from './utils/use-element-size.js';

// To align
const BOTTOM = 35;
// Arbitrary to clamp the height of the popup
const THRESHOLD = 70;

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
	canvasSize: Size;
}> = ({setIsComponentVisible, playbackRates, canvasSize}) => {
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

	const playbackPopup: React.CSSProperties = useMemo(() => {
		return {
			position: 'absolute',
			right: 0,
			width: 125,
			maxHeight: canvasSize.height - THRESHOLD - BOTTOM,
			bottom: 35,
			background: '#fff',
			borderRadius: 4,
			overflow: 'auto',
			color: 'black',
			textAlign: 'left',
		};
	}, [canvasSize.height]);

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

const label: React.CSSProperties = {
	fontSize: 13,
	fontWeight: 'bold',
	color: 'white',
	border: '2px solid white',
	borderRadius: 20,
	paddingLeft: 8,
	paddingRight: 8,
	paddingTop: 2,
	paddingBottom: 2,
};

export const playerButtonStyle: React.CSSProperties = {
	appearance: 'none',
	backgroundColor: 'transparent',
	border: 'none',
	cursor: 'pointer',
	paddingLeft: 0,
	paddingRight: 0,
	paddingTop: 6,
	paddingBottom: 6,
	height: 37,
	display: 'inline-flex',
	marginBottom: 0,
	marginTop: 0,
	alignItems: 'center',
};

const button: React.CSSProperties = {
	...playerButtonStyle,
	position: 'relative',
};

export const PlaybackrateControl: React.FC<{
	playbackRates: number[];
	canvasSize: Size;
}> = ({playbackRates, canvasSize}) => {
	const {ref, isComponentVisible, setIsComponentVisible} =
		useComponentVisible(false);
	const {playbackRate} = useContext(Internals.Timeline.TimelineContext);

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
				style={button}
				onClick={onClick}
			>
				<div style={label}>{playbackRate}x</div>
				{isComponentVisible && (
					<PlaybackPopup
						canvasSize={canvasSize}
						playbackRates={playbackRates}
						setIsComponentVisible={setIsComponentVisible}
					/>
				)}
			</button>
		</div>
	);
};
