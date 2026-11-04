import {Audio} from '@remotion/media';
import {AnimatedCaptions} from './AnimatedCaptions';
import {VOICEOVER_SRC} from './voiceover';

export const Narration = () => (
	<>
		<Audio name="Voiceover" src={VOICEOVER_SRC} />
		<div
			style={{
				position: 'absolute',
				inset: 0,
				zIndex: 2147483647,
				pointerEvents: 'none',
			}}
		>
			<AnimatedCaptions
				name="Animated captions"
				width={1080}
				height={360}
				durationInFrames={1608}
				theme="dark"
				style={{
					position: 'absolute',
					translate: '0px 1260px',
					scale: 0.9,
					transformOrigin: '50% 0%',
				}}
			/>
		</div>
	</>
);
