import {OffthreadVideo, Series} from 'remotion';
import {
	fps,
	sources,
	type Props,
} from './OffthreadRemoteSeries-calculate-metadata';

export const OffthreadRemoteSeriesComponent: React.FC<Props> = ({
	durations,
}) => {
	if (durations === null) {
		throw new Error('Durations are null');
	}

	return (
		<>
			<Series>
				{sources.map((src, index) => (
					<Series.Sequence
						durationInFrames={durations[index] * fps}
						layout="none"
						key={index}
					>
						<OffthreadVideo src={src} />
					</Series.Sequence>
				))}
			</Series>
		</>
	);
};
