import {renderStillOnWeb} from '@remotion/web-renderer';
import {useCallback} from 'react';
import {Internals} from 'remotion';
import {Button} from '../Button';
import {getCurrentFrame} from '../Timeline/imperative-state';

const button: React.CSSProperties = {
	paddingLeft: 7,
	paddingRight: 7,
	paddingTop: 7,
	paddingBottom: 7,
};

export const TriggerWebRender = () => {
	const video = Internals.useVideo();
	const frame = getCurrentFrame();

	const onClick = useCallback(() => {
		if (!video) {
			throw new Error('No video found');
		}

		renderStillOnWeb({
			component: video.component,
			width: video.width,
			height: video.height,
			fps: video.fps,
			durationInFrames: video.durationInFrames,
			frame,
			inputProps: {},
		}).then((blob) => {
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'composed.png';
			a.click();
			URL.revokeObjectURL(url);
		});
	}, [video, frame]);

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
