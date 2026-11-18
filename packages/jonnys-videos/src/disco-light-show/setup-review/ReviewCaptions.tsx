import type {Caption} from '@remotion/captions';
import {Interactive, useCurrentFrame, useVideoConfig} from 'remotion';

type ReviewCaptionsProps = {
	readonly captions: Caption[];
	readonly sourceStartSeconds: number;
};

const ReviewCaptionsInner = ({
	captions,
	sourceStartSeconds,
}: ReviewCaptionsProps) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const sourceMs = (sourceStartSeconds + frame / fps) * 1000;
	const text = captions
		.filter(
			(caption) => caption.startMs <= sourceMs && caption.endMs > sourceMs,
		)
		.map((caption) => caption.text)
		.join('')
		.trim();

	if (text.length === 0) {
		return null;
	}

	return (
		<div
			style={{
				position: 'absolute',
				left: 104,
				top: 792,
				width: 1200,
				boxSizing: 'border-box',
				padding: '14px 22px 18px',
				borderRadius: 10,
				backgroundColor: '#0b1018ed',
				color: '#ffffff',
				fontFamily: 'Arial, Helvetica, sans-serif',
			}}
		>
			<div
				style={{
					color: '#d6fa59',
					fontSize: 13,
					fontWeight: 700,
					letterSpacing: 1.5,
					lineHeight: 1.2,
					marginBottom: 8,
				}}
			>
				WORKING TRANSCRIPT · APPROXIMATE
			</div>
			<div
				style={{
					fontSize: 30,
					lineHeight: 1.2,
					display: '-webkit-box',
					WebkitBoxOrient: 'vertical',
					WebkitLineClamp: 2,
					overflow: 'hidden',
				}}
			>
				{text}
			</div>
		</div>
	);
};

export const ReviewCaptions = Interactive.create({
	Component: ReviewCaptionsInner,
	layout: 'absolute-fill',
	schema: {
		...Interactive.captionsSchema,
		sourceStartSeconds: {
			type: 'number',
			default: 0,
			min: 0,
			step: 0.1,
			keyframable: false,
			hiddenFromList: false,
			description: 'Source in point (seconds)',
		},
	},
});
