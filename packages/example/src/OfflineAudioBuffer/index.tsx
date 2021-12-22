import {Sequence} from 'remotion';

import {OfflineAudioBufferExample} from './OfflineAudioBufferExample';

const OfflineAudioBuffer: React.FC = () => {
	return (
		<div style={{background: '#444456', width: '100%', height: '100%'}}>
			<Sequence from={0} durationInFrames={150}>
				<OfflineAudioBufferExample />
			</Sequence>
		</div>
	);
};

export default OfflineAudioBuffer;
