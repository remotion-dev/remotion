import React, {useCallback, useContext} from 'react';
import {Internals, useCurrentFrame} from 'remotion';
import {getDefaultOutLocation} from '../../get-default-out-name';
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

		setSelectedModal({
			type: 'render',
			compositionId: video.id,
			initialFrame: frame,
			initialImageFormat: 'png',
			initialOutName: getDefaultOutLocation({
				compositionName: video.id,
				defaultExtension: 'png',
			}),
			// TODO: Determine defaults from config file
			initialQuality: 80,
			initialScale: 1,
			initialVerbose: false,
		});
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
