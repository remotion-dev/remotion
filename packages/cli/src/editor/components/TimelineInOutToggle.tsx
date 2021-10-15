import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Internals} from 'remotion';
import {useKeybinding} from '../helpers/use-keybinding';
import {
	TimelineInPointer,
	TimelineOutPointer,
} from '../icons/timelineInOutPointer';
import {ControlButton} from './ControlButton';

const MIN_FRAMES_BETWEEN_POINTS = 1;
const getTooltipText = (pointType: string) => `Mark ${pointType}`;

const style: React.CSSProperties = {
	width: 16,
	height: 16,
};

export const TimelineInOutPointToggle: React.FC = () => {
	const [inFrameBtnActive, setInFrameBtnActiveState] = useState(false);
	const [outFrameBtnActive, setOutFrameBtnActiveState] = useState(false);
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const {currentComposition} = useContext(Internals.CompositionManager);
	const {
		inFrame,
		outFrame,
	} = Internals.Timeline.useTimelineInOutFramePosition();
	const {
		setInFrame,
		setOutFrame,
	} = Internals.Timeline.useTimelineSetInOutFramePosition();
	const videoConfig = Internals.useUnsafeVideoConfig();
	const keybindings = useKeybinding();

	const getValidFrame = useCallback(
		(type: 'inFrame' | 'outFrame') => {
			let validInFrame = null;
			let validOutFrame = null;

			if (!videoConfig) {
				return {validInFrame, validOutFrame};
			}

			if (type === 'inFrame') {
				validInFrame = timelinePosition;
				if (outFrame !== null && timelinePosition <= outFrame) {
					validOutFrame =
						timelinePosition === outFrame
							? timelinePosition + MIN_FRAMES_BETWEEN_POINTS
							: outFrame;
					if (validOutFrame > videoConfig.durationInFrames - 1) {
						validInFrame = timelinePosition - MIN_FRAMES_BETWEEN_POINTS;
						validOutFrame = videoConfig.durationInFrames - 1;
					}
				}
			} else {
				validOutFrame = timelinePosition;
				if (inFrame !== null && timelinePosition >= inFrame) {
					validInFrame =
						timelinePosition === inFrame
							? timelinePosition - MIN_FRAMES_BETWEEN_POINTS
							: inFrame;
					if (validInFrame < 0) {
						validInFrame = 0;
						validOutFrame = timelinePosition + MIN_FRAMES_BETWEEN_POINTS;
					}
				}
			}

			return {validInFrame, validOutFrame};
		},
		[inFrame, outFrame, timelinePosition, videoConfig]
	);

	const onInFrameBtnClick = useCallback(() => {
		if (!videoConfig) {
			return null;
		}

		const {validInFrame, validOutFrame} = getValidFrame('inFrame');
		setInFrame(inFrameBtnActive ? null : validInFrame);
		setOutFrame(inFrameBtnActive ? outFrame : validOutFrame);
		setInFrameBtnActiveState(!inFrameBtnActive);
		if (validOutFrame === null) {
			setOutFrameBtnActiveState(inFrameBtnActive ? outFrameBtnActive : false);
		}
	}, [
		getValidFrame,
		inFrameBtnActive,
		outFrame,
		outFrameBtnActive,
		setInFrame,
		setOutFrame,
		videoConfig,
	]);

	const onOutFrameBtnClick = useCallback(() => {
		if (!videoConfig) {
			return null;
		}

		const {validInFrame, validOutFrame} = getValidFrame('outFrame');
		setInFrame(outFrameBtnActive ? inFrame : validInFrame);
		setOutFrame(outFrameBtnActive ? null : validOutFrame);
		setOutFrameBtnActiveState(!outFrameBtnActive);
		if (validInFrame === null) {
			setInFrameBtnActiveState(outFrameBtnActive ? inFrameBtnActive : false);
		}
	}, [
		getValidFrame,
		inFrame,
		inFrameBtnActive,
		outFrameBtnActive,
		setInFrame,
		setOutFrame,
		videoConfig,
	]);

	useEffect(() => {
		setInFrame(null);
		setInFrameBtnActiveState(false);
		setOutFrame(null);
		setOutFrameBtnActiveState(false);
	}, [currentComposition, setInFrame, setOutFrame]);

	useEffect(() => {
		const iKey = keybindings.registerKeybinding('keypress', 'i', () => {
			onInFrameBtnClick();
		});
		const oKey = keybindings.registerKeybinding('keypress', 'o', () => {
			onOutFrameBtnClick();
		});
		return () => {
			oKey.unregister();
			iKey.unregister();
		};
	}, [keybindings, onInFrameBtnClick, onOutFrameBtnClick]);

	return (
		<>
			<ControlButton
				title={getTooltipText('In')}
				aria-label={getTooltipText('In')}
				onClick={onInFrameBtnClick}
			>
				<TimelineInPointer
					color={inFrameBtnActive ? 'var(--blue)' : 'white'}
					style={style}
				/>
			</ControlButton>
			<ControlButton
				title={getTooltipText('Out')}
				aria-label={getTooltipText('Out')}
				onClick={onOutFrameBtnClick}
			>
				<TimelineOutPointer
					color={outFrameBtnActive ? 'var(--blue)' : 'white'}
					style={style}
				/>
			</ControlButton>
		</>
	);
};
