import {PlayerInternals} from '@remotion/player';
import {useCallback, useContext} from 'react';
import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import {useTimelineInOutFramePosition} from '../../state/in-out';
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
	const {inFrame, outFrame} = useTimelineInOutFramePosition();

	const {setSelectedModal} = useContext(ModalsContext);

	const onClick = useCallback(() => {
		if (!video?.id) {
			return null;
		}

		const defaults = window.remotion_renderDefaults;

		if (!defaults) {
			throw new TypeError('Expected defaults');
		}

		const frame = getCurrentFrame();

		setSelectedModal({
			type: 'web-render',
			initialFrame: frame,
			compositionId: video.id,
			defaultProps: video.defaultProps,
			inFrameMark: inFrame,
			outFrameMark: outFrame,
			initialLogLevel: defaults.logLevel as LogLevel,
		});
	}, [
		getCurrentFrame,
		inFrame,
		outFrame,
		setSelectedModal,
		video?.defaultProps,
		video?.id,
	]);

	if (!video) {
		return null;
	}

	return (
		<Button onClick={onClick} buttonContainerStyle={button} disabled={false}>
			<span style={label}>Render on web</span>
		</Button>
	);
};
