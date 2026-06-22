import {burlap} from '@remotion/effects/burlap';
import {Solid, staticFile} from 'remotion';
import {Video} from '@remotion/media';
import {colorKey} from '@remotion/effects/color-key';

export const EffectsAnnouncement = () => {
	return (
		<>
			<Solid
				width={1280}
				height={720}
				style={{
					position: 'absolute',
				}}
				color={'#ffffff'}
				effects={[burlap({})]}
			/>
			<Video
				src={staticFile('woman-dancin.mp4')}
				style={{
					position: 'absolute',
					translate: '-242.5px -144.8px',
					width: 1920,
					height: 1080,
				}}
				effects={[
					colorKey({
						similarity: 0.19,
						keyColor: '#6ed860',
						spillSuppression: 0.91,
						smoothness: 0.01,
					}),
				]}
			/>
		</>
	);
};
