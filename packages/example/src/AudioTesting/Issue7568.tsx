import {Audio} from '@remotion/media';
import {
	AbsoluteFill,
	Html5Audio,
	Internals,
	Sequence,
	useCurrentFrame,
} from 'remotion';

const {useFrameForVolumeProp} = Internals;

const Probe: React.FC<{readonly label: string}> = ({label}) => {
	const frame = useCurrentFrame();
	const volumeFrame = useFrameForVolumeProp('repeat');

	return (
		<div style={{fontFamily: 'monospace', fontSize: 36}}>
			{label}: currentFrame={frame} volumeFrame={volumeFrame}
		</div>
	);
};

export const Issue7568: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				gap: 30,
				padding: 60,
				backgroundColor: '#111',
				color: 'white',
			}}
		>
			<div style={{fontSize: 32}}>
				Issue #7568 repro: At timeline frame 0, both volume frames should be 0.
			</div>
			<Sequence from={-30} layout="none">
				<Probe label="Html5Audio (direct)" />
				<Html5Audio src="https://remotion.media/music.mp3" volume={() => 0} />
			</Sequence>
			<Sequence from={-30} layout="none">
				<Sequence layout="none">
					<Probe label="@remotion/media Audio (wrapped)" />
				</Sequence>
				<Audio src="https://remotion.media/music.mp3" volume={() => 0} />
			</Sequence>
		</AbsoluteFill>
	);
};
