import {PlayerInternals} from '@remotion/player';
import {useCallback, useContext} from 'react';
import {Internals} from 'remotion';
import {ModalsContext} from '../../state/modals';
import {Button} from '../Button';

const button: React.CSSProperties = {
	paddingLeft: 7,
	paddingRight: 7,
	paddingTop: 7,
	paddingBottom: 7,
};

const label: React.CSSProperties = {
	fontSize: 14,
};

export const TriggerWebRender = () => {
	const video = Internals.useVideo();
	const getCurrentFrame = PlayerInternals.useFrameImperative();

	const frame = getCurrentFrame();
	const {setSelectedModal} = useContext(ModalsContext);

	const onClick = useCallback(() => {
		if (!video?.id) {
			return null;
		}

		setSelectedModal({
			type: 'web-render',
			initialFrame: frame,
			compositionId: video.id,
		});
	}, [frame, setSelectedModal, video?.id]);

	if (!video) {
		return null;
	}

	return (
		<Button
			id="render-modal-button"
			onClick={onClick}
			buttonContainerStyle={button}
			disabled={false}
		>
			<span style={label}>Render on the web</span>
		</Button>
	);
};
