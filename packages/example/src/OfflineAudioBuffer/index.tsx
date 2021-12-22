import {useCurrentFrame, Sequence} from 'remotion';

import {OfflineAudioBufferExample} from './OfflineAudioBufferExample';

const OfflineAudioBuffer: React.FC = () => {
	const frame = useCurrentFrame();
	const transitionStart = 5;

	return (
		<div style={{background: '#444456', width: '100%', height: '100%'}}>
			<Sequence from={1} durationInFrames={149}>
				{frame > transitionStart && <OfflineAudioBufferExample />}
			</Sequence>
		</div>
	);
};

export default OfflineAudioBuffer;
