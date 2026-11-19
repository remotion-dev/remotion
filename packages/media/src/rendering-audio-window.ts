import {useContext, useMemo} from 'react';
import {Internals} from 'remotion';

export const useRenderingAudioWindow = ({
	frame,
	fps,
	sampleRate,
}: {
	frame: number;
	fps: number;
	sampleRate: number;
}) => {
	const sequence = useContext(Internals.SequenceContext);
	const timeline = Internals.useTimelineContext();
	const outputFrame = timeline.clientAudioOutputFrame ?? null;
	const sampleFrame = timeline.clientAudioSampleFrame ?? outputFrame;
	const sequenceRate = sequence?.playbackRate ?? 1;
	const firstAudioFrame = Math.max(0, -(sequence?.cumulatedNegativeFrom ?? 0));
	const endFrame = sequence?.durationInFrames ?? Infinity;
	const sourceOrigin = sequence?.absoluteFrom ?? 0;

	return useMemo(() => {
		if (outputFrame === null || sampleFrame === null) {
			return {
				timestamp: frame / sequenceRate / fps,
				durationInSeconds: 1 / fps,
				startSample: null,
				sampleCount: null,
			};
		}

		const samplesPerFrame = sampleRate / fps;
		const localStart = Math.max(firstAudioFrame, frame);
		const localEnd = Math.min(
			endFrame,
			frame + (outputFrame + 1 - sampleFrame) * sequenceRate,
		);
		const startSample = Math.round(
			(sampleFrame + (localStart - frame) / sequenceRate) * samplesPerFrame,
		);
		const endSample = Math.round(
			(sampleFrame + (localEnd - frame) / sequenceRate) * samplesPerFrame,
		);
		const sampleCount = Math.max(0, endSample - startSample);

		// Align placement and source offsets on the same output lattice. Rounding
		// each leaf's elapsed duration independently can repeat a sample at a cut.
		const sourceOffset =
			Math.round((sourceOrigin + localStart / sequenceRate) * samplesPerFrame) -
			Math.round(
				(sourceOrigin + firstAudioFrame / sequenceRate) * samplesPerFrame,
			);
		const timestamp =
			firstAudioFrame / sequenceRate / fps + sourceOffset / sampleRate;
		return {
			timestamp,
			durationInSeconds: sampleCount / sampleRate,
			startSample,
			sampleCount,
		};
	}, [
		endFrame,
		firstAudioFrame,
		fps,
		frame,
		outputFrame,
		sampleFrame,
		sampleRate,
		sequenceRate,
		sourceOrigin,
	]);
};
