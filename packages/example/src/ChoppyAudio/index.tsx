import {Audio, Sequence} from 'remotion';

export const ChoppyAudio: React.FC = () => {
	return (
		<div>
			<Sequence from={0} durationInFrames={100}>
				<Audio src="https://res.cloudinary.com/arthurdenner/video/upload/v1632482233/Remotion/kid-laugh.mp3" />
			</Sequence>
			<Sequence from={101} durationInFrames={100}>
				<Audio src="https://res.cloudinary.com/arthurdenner/video/upload/v1632482233/Remotion/kid-laugh.mp3" />
			</Sequence>
		</div>
	);
};
