import {burlap} from '@remotion/effects/burlap';
import {colorKey} from '@remotion/effects/color-key';
import {hue} from '@remotion/effects/hue';
import {uvTranslate} from '@remotion/effects/translate';
import {Video} from '@remotion/media';
import {Solid} from 'remotion';

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
				src="https://remotion.media/woman-dancing.mp4"
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
					uvTranslate({
						u: 0.14,
						v: 0.22,
					}),
					hue({}),
				]}
			/>
		</>
	);
};
