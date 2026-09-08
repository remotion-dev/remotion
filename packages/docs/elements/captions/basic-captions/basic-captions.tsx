import type {Caption} from '@remotion/captions';
import {createTikTokStyleCaptions} from '@remotion/captions';
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

type BasicCaptionsProps = InteractiveBaseProps &
	InteractiveTransformProps &
	Pick<SequenceProps, 'width' | 'height'> & {
		readonly captions?: Caption[];
		readonly combineTokensWithinMilliseconds?: number;
	};

type BasicCaptionsLayerProps = Omit<BasicCaptionsProps, 'captions'> & {
	readonly callerStyle: React.CSSProperties | null;
	readonly captions: Caption[];
};

const defaultCombineTokensWithinMilliseconds = 2000;
const maximumTextWidth = 800;

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
		default: defaultCombineTokensWithinMilliseconds,
		description: 'Time between caption pages',
		hiddenFromList: false,
	},
	callerStyle: {type: 'hidden'},
	...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const BasicCaptionsContent: React.FC<{
	readonly captionAreaWidth: number | null;
	readonly captions: Caption[];
	readonly combineTokensWithinMilliseconds: number;
}> = ({captionAreaWidth, captions, combineTokensWithinMilliseconds}) => {
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
			aria-label={page.text}
			aria-live="off"
			role="group"
			style={{
				backgroundColor: 'rgba(64, 64, 64, 0.75)',
				color: '#ffffff',
				display: '-webkit-box',
				fontFamily: 'Arial, Helvetica, sans-serif',
				fontSize: 64,
				fontWeight: 400,
				lineHeight: 1.2,
				maxWidth: Math.min(
					maximumTextWidth,
					captionAreaWidth ?? maximumTextWidth,
				),
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

const BasicCaptionsInner = forwardRef<
	HTMLDivElement,
	BasicCaptionsLayerProps & {
		readonly controls: SequenceControls | undefined;
	}
>(
	(
		{
			callerStyle,
			captions,
			combineTokensWithinMilliseconds = defaultCombineTokensWithinMilliseconds,
			controls,
			height,
			name,
			style,
			width,
			...interactiveProps
		},
		ref,
	) => {
		const outlineRef = useRef<HTMLDivElement>(null);
		const {
			rotate: callerRotate,
			scale: callerScale,
			transform: callerTransform,
			transformBox: callerTransformBox,
			transformOrigin: callerTransformOrigin,
			transformStyle: callerTransformStyle,
			translate: callerTranslate,
			...callerContentStyle
		} = callerStyle ?? {};

		useImperativeHandle(ref, () => outlineRef.current as HTMLDivElement, []);

		return (
			<Sequence
				layout="none"
				{...interactiveProps}
				controls={controls}
				name={name ?? '<BasicCaptions>'}
				outlineRef={outlineRef}
			>
				<div
					style={{
						height: height ?? '100%',
						rotate: callerRotate,
						scale: callerScale,
						transform: callerTransform,
						transformBox: callerTransformBox,
						transformOrigin: callerTransformOrigin,
						transformStyle: callerTransformStyle,
						translate: callerTranslate,
						width: width ?? '100%',
					}}
				>
					<div
						ref={outlineRef}
						style={{
							alignItems: 'center',
							display: 'flex',
							height: '100%',
							justifyContent: 'center',
							width: '100%',
							...style,
							...callerContentStyle,
						}}
					>
						<BasicCaptionsContent
							captionAreaWidth={width ?? null}
							captions={captions}
							combineTokensWithinMilliseconds={combineTokensWithinMilliseconds}
						/>
					</div>
				</div>
			</Sequence>
		);
	},
);

const BasicCaptionsLayer = Interactive.withSchema({
	Component: BasicCaptionsInner,
	componentName: '<BasicCaptions>',
	componentIdentity: null,
	schema: basicCaptionsSchema,
	supportsEffects: false,
}) as React.FC<BasicCaptionsLayerProps>;

export const BasicCaptions: React.FC<BasicCaptionsProps> = ({
	captions,
	style,
	...props
}) => {
	if (captions) {
		return (
			<BasicCaptionsLayer
				{...props}
				callerStyle={style ?? null}
				captions={captions}
				style={{translate: '0px 0px'}}
			/>
		);
	}

	return (
		<div
			style={{
				alignItems: 'center',
				display: 'flex',
				height: 220,
				justifyContent: 'center',
				width: 900,
			}}
		>
			<BasicCaptionsLayer
				{...props}
				callerStyle={style ?? null}
				captions={[
					{
						text: 'Simple captions,\nready for every video.',
						startMs: 0,
						endMs: 2200,
						timestampMs: 1100,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: 'No animation,\njust clear text.',
						startMs: 2200,
						endMs: 4400,
						timestampMs: 3300,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: 'Easy to read,\nand easy to customize.',
						startMs: 4400,
						endMs: 7000,
						timestampMs: 5700,
						confidence: null,
					},
				]}
				height={props.height ?? 220}
				width={props.width ?? 900}
				style={{translate: '0px 0px'}}
			/>
		</div>
	);
};
