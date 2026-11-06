import {colorCorrection} from '@remotion/effects/color-correction';
import {lut} from '@remotion/effects/lut';
import {CanvasImage, Interactive} from 'remotion';
import avatarAssets from './assets.json';
import {avatarLut} from './color-grade';

const MatchedAvatarInner = () => {
	return (
		<CanvasImage
			name="Framed portrait with neutral color grade"
			src={avatarAssets['portrait-7860-refined.png']}
			style={{width: '100%', height: '100%', objectFit: 'contain'}}
			effects={[
				lut({content: avatarLut}),
				colorCorrection({
					exposure: 0,
					temperature: 0,
					saturation: 1,
					contrast: 1.06,
				}),
			]}
		/>
	);
};

export const MatchedAvatar = Interactive.create({
	Component: MatchedAvatarInner,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});

export const AvatarComparison = () => {
	return (
		<>
			<CanvasImage
				name="Reference — jonny.io avatar"
				src={avatarAssets['reference.png']}
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: 1080,
					height: 1080,
				}}
			/>
			<MatchedAvatar
				name="New photo — matched framing and color"
				style={{
					left: 1080,
					top: 0,
					width: 1080,
					height: 1080,
					backgroundColor: 'white',
				}}
			/>
		</>
	);
};

export const AvatarBeforeAfter = () => {
	return (
		<>
			<CanvasImage
				name="New photo — crop before color correction"
				src={avatarAssets['framed-7860.jpg']}
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: 1080,
					height: 1080,
				}}
			/>
			<MatchedAvatar
				name="New photo — finished avatar"
				style={{
					left: 1080,
					top: 0,
					width: 1080,
					height: 1080,
					backgroundColor: 'white',
				}}
			/>
		</>
	);
};
