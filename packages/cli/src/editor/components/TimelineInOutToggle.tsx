import React, {useCallback, useEffect} from 'react';
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
	const timelinePosition = Internals.Timeline.useTimelinePosition();
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

				return {validInFrame, validOutFrame};
			}

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

			return {validInFrame, validOutFrame};
		},
		[inFrame, outFrame, timelinePosition, videoConfig]
	);

	const onInFrameBtnClick = useCallback(() => {
		if (!videoConfig) {
			return null;
		}

		const {validInFrame, validOutFrame} = getValidFrame('inFrame');

		setInFrame((prev) => {
			return prev ? null : validInFrame;
		});
		if (inFrame) {
			setOutFrame(validOutFrame);
		}
	}, [getValidFrame, inFrame, setInFrame, setOutFrame, videoConfig]);

	const onOutFrameBtnClick = useCallback(() => {
		if (!videoConfig) {
			return null;
		}

		const {validOutFrame} = getValidFrame('outFrame');
		setOutFrame((prev) => (prev ? null : validOutFrame));
	}, [getValidFrame, setOutFrame, videoConfig]);

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
					color={inFrame === null ? 'white' : 'var(--blue)'}
					style={style}
				/>
			</ControlButton>
			<ControlButton
				title={getTooltipText('Out')}
				aria-label={getTooltipText('Out')}
				onClick={onOutFrameBtnClick}
			>
				<TimelineOutPointer
					color={outFrame === null ? 'white' : 'var(--blue)'}
					style={style}
				/>
			</ControlButton>
		</>
	);
};
