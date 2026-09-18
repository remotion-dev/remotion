import React, {forwardRef, useImperativeHandle, useMemo, useRef} from 'react';
import {
	Interactive,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveBaseProps,
	type InteractiveTransformProps,
	type InteractivitySchema,
	type SequenceControls,
	type SequenceProps,
} from 'remotion';
import type {Caption} from './caption';
import {createTikTokStyleCaptions} from './create-tiktok-style-captions';

export type BasicCaptionsProps = InteractiveBaseProps &
	InteractiveTransformProps &
	Pick<
		SequenceProps,
		'from' | 'durationInFrames' | 'trimBefore' | 'width' | 'height'
	> & {
		readonly captions: Caption[];
		readonly playbackRate?: number;
		readonly combineTokensWithinMilliseconds?: number;
	};

const CaptionContent: React.FC<
	Pick<
		BasicCaptionsProps,
		'captions' | 'playbackRate' | 'combineTokensWithinMilliseconds'
	>
> = ({captions, playbackRate = 1, combineTokensWithinMilliseconds = 2000}) => {
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
	const currentTimeMs = (frame / fps) * 1000 * playbackRate;
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

const basicCaptionsSchema = {
	...Interactive.baseSchema,
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
		default: 2000,
		description: 'Time between caption pages',
		hiddenFromList: false,
	},
	...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const BasicCaptionsInner = forwardRef<
	HTMLDivElement,
	BasicCaptionsProps & {readonly controls: SequenceControls | undefined}
>(
	(
		{
			captions,
			combineTokensWithinMilliseconds,
			controls,
			durationInFrames,
			from,
			height = 220,
			name,
			playbackRate,
			style,
			trimBefore,
			width = 900,
			...interactiveProps
		},
		ref,
	) => {
		const outlineRef = useRef<HTMLDivElement>(null);
		useImperativeHandle(ref, () => outlineRef.current as HTMLDivElement, []);

		return (
			<Sequence
				layout="none"
				{...interactiveProps}
				controls={controls}
				name={name ?? 'Basic captions'}
				from={from}
				durationInFrames={durationInFrames}
				trimBefore={trimBefore}
				outlineRef={outlineRef}
			>
				<div
					ref={outlineRef}
					style={{
						alignItems: 'center',
						display: 'flex',
						justifyContent: 'center',
						position: 'absolute',
						bottom: 120,
						left: '50%',
						transform: 'translateX(-50%)',
						width,
						height,
						...style,
					}}
				>
					<CaptionContent
						captions={captions}
						combineTokensWithinMilliseconds={combineTokensWithinMilliseconds}
						playbackRate={playbackRate}
					/>
				</div>
			</Sequence>
		);
	},
);

export const BasicCaptions = Interactive.withSchema({
	Component: BasicCaptionsInner,
	componentName: '<BasicCaptions>',
	schema: basicCaptionsSchema,
	supportsEffects: false,
}) as React.FC<BasicCaptionsProps>;
