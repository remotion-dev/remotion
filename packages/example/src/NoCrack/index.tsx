import {Audio, Sequence} from 'remotion';
import audio1 from './1.mp3';
import audio2 from './2.mp3';
import bgMusic from './bgMusic.mp3';

export const NoCrack: React.FC = () => {
	return (
		<div className="audios">
			<Audio src={bgMusic} volume={0.3} />;
			<Sequence from={15}>
				<Audio src={audio1} />
			</Sequence>
			<Sequence from={90}>
				<Audio src={audio2} />
			</Sequence>
		</div>
	);
};
