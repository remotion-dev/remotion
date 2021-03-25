import React, {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import styled from 'styled-components';
import {calculateTimeline, Track} from '../helpers/calculate-timeline';
import {AudioWaveform} from './AudioWaveform';

const Container = styled.div`
	height: 100%;
	display: grid;
	grid-gap: 2px;
	grid-auto-rows: minmax(25px, 80px);
`;

const Pre = styled.pre`
	color: white;
	font-family: Arial, Helvetica, sans-serif;
	font-size: 12px;
	margin-top: 0;
	margin-bottom: 0;
	padding: 5px;
`;

const SEQUENCE_GRADIENT = 'linear-gradient(to bottom, #3697e1, #348AC7 60%)';
const AUDIO_GRADIENT = 'linear-gradient(rgb(16 171 58), rgb(43 165 63) 60%)';

export const TimelineElements: React.FC = () => {
	const {sequences, assets} = useContext(Internals.CompositionManager);
	const videoConfig = Internals.useUnsafeVideoConfig();

	const timeline = useMemo((): Track[] => {
		if (!videoConfig) {
			return [];
		}
		return calculateTimeline({
			assets,
			sequences,
			sequenceDuration: videoConfig.durationInFrames,
		});
	}, [assets, sequences, videoConfig]);

	// If a composition is 100 frames long, the last frame is 99
	// and therefore frame 99 should be at the right
	const lastFrame = (videoConfig?.durationInFrames ?? 1) - 1;

	if (!videoConfig) {
		return null;
	}

	return (
		<Container>
			{timeline.map((track) => (
				<div key={track.trackId}>
					{track.sequences.map((s) => {
						// If a duration is 1, it is essentially a still and it should have width 0
						const spatialDuration = Internals.FEATURE_FLAG_V2_BREAKING_CHANGES
							? s.sequence.duration - 1
							: s.sequence.duration;

						return (
							<div
								key={s.sequence.id}
								style={{
									background:
										s.sequence.type === 'sequence'
											? SEQUENCE_GRADIENT
											: AUDIO_GRADIENT,
									border: '1px solid rgba(255, 255, 255, 0.2)',
									borderRadius: 4,
									height: s.sequence.type === 'sequence' ? 80 : 60,
									marginTop: 1,
									marginLeft: `calc(${(s.sequence.from / lastFrame) * 100}%)`,
									width:
										s.sequence.duration === Infinity
											? 'auto'
											: `calc(${(spatialDuration / lastFrame) * 100}%)`,
									color: 'white',
									overflow: 'hidden',
								}}
								title={s.sequence.displayName}
							>
								{s.sequence.type === 'audio' ? (
									<AudioWaveform src={s.sequence.src} />
								) : null}
								<Pre>{s.sequence.displayName}</Pre>
							</div>
						);
					})}
				</div>
			))}
		</Container>
	);
};
