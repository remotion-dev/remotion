import {Video as NewVideo} from '@remotion/media';

interface NewVideoProps {
	src?: string;
}

export const NewVideoExample: React.FC<NewVideoProps> = ({src}) => {
	if (!src) {
		return <div>No video source provided</div>;
	}

	return (
		<>
			<NewVideo src={src} />
		</>
	);
};
