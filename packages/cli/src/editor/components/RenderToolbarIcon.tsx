import React, {useCallback, useContext} from 'react';
import {Internals} from 'remotion';
import {RenderStill} from '../icons/RenderStillIcon';
import {ModalsContext} from '../state/modals';
import {ControlButton} from './ControlButton';

const tooltip =
	'Enable rich timeline. Go to remotion.dev/docs/timeline for more information.';

export const RenderStillButton: React.FC = () => {
	const {setSelectedModal} = useContext(ModalsContext);
	const video = Internals.useVideo();

	const onClick = useCallback(() => {
		if (!video) {
			return null;
		}

		setSelectedModal({type: 'render', composition: video});
	}, [setSelectedModal, video]);

	if (!video) {
		return null;
	}

	return (
		<ControlButton title={tooltip} aria-label={tooltip} onClick={onClick}>
			<RenderStill
				style={{
					width: 18,
					height: 18,
					color: 'white',
				}}
			/>
		</ControlButton>
	);
};
