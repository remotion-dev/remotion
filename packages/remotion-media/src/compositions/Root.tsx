import {Composition} from 'remotion';
import {Spiral} from './Spiral';
import {Tone} from './Tone';

export const Root = () => {
	return (
		<>
			<Composition
				id="Base"
				component={Spiral}
				durationInFrames={30 * 30 * 60}
				width={1920}
				height={1080}
				calculateMetadata={({props}) => {
					return {
						fps: (props.fps as number) ?? 30,
					};
				}}
			/>
			<Composition
				id="Tone"
				component={Tone}
				durationInFrames={30 * 30 * 60}
				fps={30}
				width={1920}
				height={1080}
			/>
		</>
	);
};
