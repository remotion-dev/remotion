import type {LogLevel} from '@remotion/renderer';
import React, {useCallback, useContext} from 'react';
import {Internals, useCurrentFrame} from 'remotion';
import {getDefaultOutLocation} from '../../get-default-out-name';
import {PreviewServerConnectionCtx} from '../helpers/client-id';
import {RenderStill} from '../icons/RenderStillIcon';
import {ModalsContext} from '../state/modals';
import {ControlButton} from './ControlButton';

const style: React.CSSProperties = {
	width: 18,
	height: 18,
	color: 'white',
};

export const RenderStillButton: React.FC = () => {
	const {setSelectedModal} = useContext(ModalsContext);
	const {type} = useContext(PreviewServerConnectionCtx);

	const tooltip =
		type === 'connected'
			? 'Export the current frame as a still image'
			: 'Connect to the preview server to render';

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
			// TODO: JPEG for video, PNG for image
			initialImageFormat: 'png',
			initialOutName: getDefaultOutLocation({
				compositionName: video.id,
				defaultExtension: 'png',
			}),
			// TODO: Determine defaults from config file
			initialQuality: window.remotion_renderDefaults?.quality ?? 80,
			initialScale: window.remotion_renderDefaults?.scale ?? 1,
			initialVerbose:
				(window.remotion_renderDefaults?.logLevel as LogLevel) === 'verbose',
		});
	}, [frame, setSelectedModal, video]);

	if (!video) {
		return null;
	}

	return (
		<ControlButton
			disabled={type !== 'connected'}
			title={tooltip}
			aria-label={tooltip}
			onClick={onClick}
		>
			<RenderStill style={style} />
		</ControlButton>
	);
};
