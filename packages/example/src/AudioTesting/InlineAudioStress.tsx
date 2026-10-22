import {Audio} from '@remotion/media';
import {Sequence, useCurrentFrame} from 'remotion';

export type InlineAudioStressClip = {
	readonly outerFrom: number;
	readonly middleFrom: number;
	readonly innerFrom: number;
	readonly durationInFrames: number;
};

export type InlineAudioStressRange = {
	readonly from: number;
	readonly durationInFrames: number;
};

export type InlineAudioStressProps = {
	readonly src: string;
	readonly clips: InlineAudioStressClip[];
	readonly intermittentOuterFrom: number;
	readonly intermittentInnerFrom: number;
	readonly intermittentDurationInFrames: number;
	readonly intermittentRanges: InlineAudioStressRange[];
};

const IntermittentAudio: React.FC<{
	readonly src: string;
	readonly ranges: InlineAudioStressRange[];
}> = ({src, ranges}) => {
	const frame = useCurrentFrame();
	const isMounted = ranges.some(
		(range) =>
			frame >= range.from && frame < range.from + range.durationInFrames,
	);

	return isMounted ? <Audio src={src} loop volume={0.125} /> : null;
};

export const InlineAudioStress: React.FC<InlineAudioStressProps> = ({
	src,
	clips,
	intermittentOuterFrom,
	intermittentInnerFrom,
	intermittentDurationInFrames,
	intermittentRanges,
}) => {
	return (
		<>
			{clips.map((clip, index) => (
				<Sequence
					key={index}
					from={clip.outerFrom}
					durationInFrames={
						clip.middleFrom + clip.innerFrom + clip.durationInFrames
					}
				>
					<Sequence
						from={clip.middleFrom}
						durationInFrames={clip.innerFrom + clip.durationInFrames}
					>
						<Sequence
							from={clip.innerFrom}
							durationInFrames={clip.durationInFrames}
						>
							<Audio src={src} loop volume={0.25} />
						</Sequence>
					</Sequence>
				</Sequence>
			))}
			<Sequence
				from={intermittentOuterFrom}
				durationInFrames={intermittentInnerFrom + intermittentDurationInFrames}
			>
				<Sequence
					from={intermittentInnerFrom}
					durationInFrames={intermittentDurationInFrames}
				>
					<IntermittentAudio src={src} ranges={intermittentRanges} />
				</Sequence>
			</Sequence>
		</>
	);
};

export const inlineAudioStressDefaultProps: InlineAudioStressProps = {
	src: '',
	clips: [],
	intermittentOuterFrom: 0,
	intermittentInnerFrom: 0,
	intermittentDurationInFrames: 1,
	intermittentRanges: [],
};
