import React, {useCallback, useContext} from 'react';
import {Internals, useCurrentFrame} from 'remotion';
import {RenderStill} from '../icons/RenderStillIcon';
import {ModalsContext} from '../state/modals';
import {ControlButton} from './ControlButton';

const tooltip = 'Export the current frame as a still image';

const style: React.CSSProperties = {
	width: 18,
	height: 18,
	color: 'white',
};

export const RenderStillButton: React.FC = () => {
	const {setSelectedModal} = useContext(ModalsContext);
	const video = Internals.useVideo();
	const frame = useCurrentFrame();

	const onClick = useCallback(() => {
		if (!video) {
			return null;
		}

		setSelectedModal({type: 'render', composition: video, initialFrame: frame});
	}, [frame, setSelectedModal, video]);

	if (!video) {
		return null;
	}

	return (
		<ControlButton title={tooltip} aria-label={tooltip} onClick={onClick}>
			<RenderStill style={style} />
		</ControlButton>
	);
};
