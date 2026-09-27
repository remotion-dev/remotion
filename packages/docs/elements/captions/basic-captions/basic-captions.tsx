import type {Caption} from '@remotion/captions';
import {createTikTokStyleCaptions} from '@remotion/captions';
import React, {useMemo} from 'react';
import {
	Interactive,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
	type InteractivitySchema,
	type SequenceProps,
} from 'remotion';

type BasicCaptionsProps = InteractiveTransformProps &
	Pick<SequenceProps, 'width' | 'height'> & {
		readonly captions: Caption[];
		readonly combineTokensWithinMilliseconds?: number;
	};

const defaultCombineTokensWithinMilliseconds = 2000;
const defaultWidth = 900;
const defaultHeight = 220;

const basicCaptionsSchema = {
	...Interactive.captionsSchema,
	width: {
		type: 'number',
		min: 1,
		step: 1,
		default: undefined,
		description: 'Caption area width',
		hiddenFromList: false,
	},
	height: {
		type: 'number',
		min: 1,
		step: 1,
		default: undefined,
		description: 'Caption area height',
		hiddenFromList: false,
	},
	combineTokensWithinMilliseconds: {
		type: 'number',
		min: 0,
		step: 50,
		default: defaultCombineTokensWithinMilliseconds,
		description: 'Time between caption pages',
		hiddenFromList: false,
	},
	...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const BasicCaptionsContent: React.FC<{
	readonly captions: Caption[];
	readonly combineTokensWithinMilliseconds: number;
}> = ({captions, combineTokensWithinMilliseconds}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pages = useMemo(
		() =>
			createTikTokStyleCaptions({
				captions,
				combineTokensWithinMilliseconds,
			}).pages,
		[captions, combineTokensWithinMilliseconds],
	);
	const currentTimeMs = (frame / fps) * 1000;
	const page = pages.find(
		(candidate) =>
			currentTimeMs >= candidate.startMs &&
			currentTimeMs < candidate.startMs + candidate.durationMs,
	);

	if (!page) {
		return null;
	}

	return (
		<div
			style={{
				backgroundColor: 'rgba(64, 64, 64, 0.75)',
				color: '#ffffff',
				display: '-webkit-box',
				fontFamily: 'Arial, Helvetica, sans-serif',
				fontSize: 64,
				fontWeight: 400,
				lineHeight: 1.2,
				overflow: 'hidden',
				padding: '14px 22px',
				textAlign: 'center',
				textWrap: 'balance',
				WebkitBoxOrient: 'vertical',
				WebkitLineClamp: 2,
				whiteSpace: 'pre-wrap',
			}}
		>
			{page.text.trim()}
		</div>
	);
};

const BasicCaptionsInner: React.FC<BasicCaptionsProps> = ({
	captions,
	combineTokensWithinMilliseconds = defaultCombineTokensWithinMilliseconds,
	height = defaultHeight,
	style,
	width = defaultWidth,
}) => {
	return (
		<div
			style={{
				alignItems: 'center',
				display: 'flex',
				justifyContent: 'center',
				marginInline: 'auto',
				width,
				height,
				...style,
			}}
		>
			<BasicCaptionsContent
				captions={captions}
				combineTokensWithinMilliseconds={combineTokensWithinMilliseconds}
			/>
		</div>
	);
};

const BasicCaptionsLayer = Interactive.withSchema({
	Component: BasicCaptionsInner,
	componentName: '<BasicCaptions>',
	schema: basicCaptionsSchema,
	wrapInSequence: true,
});

export const BasicCaptions = BasicCaptionsLayer;
