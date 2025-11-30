import {Audio as NewAudio} from '@remotion/media';

interface NewAudioProps {
	src?: string;
}

export const NewAudioExample: React.FC<NewAudioProps> = ({src}) => {
	if (!src) {
		return <div>No audio source provided</div>;
	}

	return (
		<>
			<NewAudio src={src} />
		</>
	);
};
