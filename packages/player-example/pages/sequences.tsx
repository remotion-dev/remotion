import {Player} from '@remotion/player';
import {Seq} from '../src/Seq';

const Sequences = () => {
	return (
		<Player
			style={{
				height: 500,
				width: 'auto',
			}}
			logLevel="trace"
			component={Seq}
			compositionHeight={720}
			compositionWidth={1280}
			durationInFrames={900}
			fps={30}
			controls
			acknowledgeRemotionLicense
		></Player>
	);
};

export default Sequences;
