import {createTikTokStyleCaptions, type Caption} from '@remotion/captions';
import React, {useMemo} from 'react';
import {
	AbsoluteFill,
	Interactive,
	Series,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
} from 'remotion';

const CaptionsContent: React.FC<
	InteractiveTransformProps & {readonly captions: Caption[]}
> = ({captions, style}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {pages} = useMemo(
		() =>
			createTikTokStyleCaptions({
				captions,
				combineTokensWithinMilliseconds: 3000,
			}),
		[captions],
	);
	const currentTimeMs = (frame / fps) * 1000;
	const page = pages.find(
		(candidate) =>
			currentTimeMs >= candidate.startMs &&
			currentTimeMs < candidate.startMs + candidate.durationMs,
	);

	return <div style={style}>{page?.text.trim()}</div>;
};

const BasicCaptions = Interactive.withSchema({
	Component: CaptionsContent,
	componentName: '<BasicCaptions>',
	schema: Interactive.captionsSchema,
	wrapInSequence: true,
});

// https://github.com/remotion-dev/remotion/issues/11891
// In Visual Mode, expand "Presenter introduction (2)" and drag the left edge
// of its captions to the right. The captions' visible start should move.
// The captions' timing and right edge should stay unchanged.
export const CaptionLeftEdgeTrimRepro: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#111827',
				color: 'white',
				fontFamily: 'sans-serif',
				fontSize: 64,
			}}
		>
			<Series>
				<Series.Sequence name="Lead-in" durationInFrames={30}>
					<AbsoluteFill
						style={{justifyContent: 'center', alignItems: 'center'}}
					>
						Caption left edge trim reproduction
					</AbsoluteFill>
				</Series.Sequence>
				<Series.Sequence
					name="Presenter introduction (2)"
					durationInFrames={129}
					premountFor={30}
					trimBefore={369}
				>
					<BasicCaptions
						name="Presenter introduction (2) captions"
						captions={[
							{
								text: 'Drag the left edge of this caption track',
								startMs: 12000,
								endMs: 18000,
								timestampMs: 15000,
								confidence: null,
							},
						]}
						style={{position: 'absolute', left: 100, bottom: 100}}
						from={33}
						durationInFrames={465}
						trimBefore={33}
					/>
				</Series.Sequence>
				<Series.Sequence name="Tail" durationInFrames={30} />
			</Series>
		</AbsoluteFill>
	);
};
