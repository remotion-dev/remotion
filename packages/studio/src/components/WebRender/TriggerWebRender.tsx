import {renderMediaOnWeb} from '@remotion/web-renderer';
import {useCallback} from 'react';
import {Internals} from 'remotion';
import {Button} from '../Button';

const button: React.CSSProperties = {
	paddingLeft: 7,
	paddingRight: 7,
	paddingTop: 7,
	paddingBottom: 7,
};

export const TriggerWebRender = () => {
	const video = Internals.useVideo();

	const onClick = useCallback(() => {
		if (!video) {
			throw new Error('No video found');
		}

		renderMediaOnWeb({
			Component: video.component,
			width: video.width,
			height: video.height,
			fps: video.fps,
			durationInFrames: video.durationInFrames,
		});
	}, [video]);

	return (
		<Button
			id="render-modal-button"
			onClick={onClick}
			buttonContainerStyle={button}
			disabled={false}
		>
			<span>Render</span>
		</Button>
	);
};
