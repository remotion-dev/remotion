// Adapted from the Rounded Captions Element (.claude/elements/captions/
// rounded-captions, from remotion.dev/elements). The Element loads Figtree
// from Google Fonts, which crashes renders in this sandbox, so this copy takes
// the family as a prop and RoundedTextBoxScene mounts it only after its
// self-hosted Bangers file has loaded (Bangers has one weight, 400). Otherwise
// unchanged: Interactive.withSchema() with the base, captions and transform
// schemas, and fitTextOnNLines()/measureText() with validateFontIsLoaded.
import type {Caption} from '@remotion/captions';
import {createTikTokStyleCaptions} from '@remotion/captions';
import {fitTextOnNLines, measureText} from '@remotion/layout-utils';
import {createRoundedTextBox} from '@remotion/rounded-text-box';
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

type RoundedCaptionsProps = InteractiveBaseProps &
	InteractiveTransformProps &
	Pick<SequenceProps, 'width' | 'height'> & {
		readonly captions: Caption[];
		readonly playbackRate: number | null;
		readonly combineTokensWithinMilliseconds: number | null;
		// Adapted: the caller loads the font and passes its family.
		readonly fontFamily: string;
	};

const defaultCombineTokensWithinMilliseconds = 2000;
const defaultWidth = 900;
const defaultHeight = 220;
const fontWeight = '400';
const maxFontSize = 64;
const lineHeight = 1.5;
const horizontalPadding = 22;
const borderRadius = 20;

const roundedCaptionsSchema = {
	...Interactive.baseSchema,
	...Interactive.captionsSchema,
	width: {
		type: 'number',
		min: horizontalPadding * 2 + 1,
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

const RoundedCaptionsContent: React.FC<{
	readonly captions: Caption[];
	readonly playbackRate: number;
	readonly trimBefore: number;
	readonly combineTokensWithinMilliseconds: number;
	readonly fontFamily: string;
	readonly width: number;
	readonly height: number;
}> = ({
	captions,
	playbackRate,
	trimBefore,
	combineTokensWithinMilliseconds,
	fontFamily,
	width,
	height,
}) => {
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
	// The Sequence frame already includes trimBefore; only elapsed frames speed up.
	const currentTimeMs =
		((trimBefore + (frame - trimBefore) * playbackRate) / fps) * 1000;
	const page = pages.find(
		(candidate) =>
			currentTimeMs >= candidate.startMs &&
			currentTimeMs < candidate.startMs + candidate.durationMs,
	);
	const layout = useMemo(() => {
		if (!page?.text.trim()) {
			return null;
		}

		const paragraphs = page.text
			.trim()
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter(Boolean);
		const maxLines = Math.max(2, paragraphs.length);
		const fitted = paragraphs.map((text) =>
			fitTextOnNLines({
				text,
				maxLines: paragraphs.length === 1 ? maxLines : 1,
				maxBoxWidth: Math.max(1, width - horizontalPadding * 2),
				fontFamily,
				fontWeight,
				maxFontSize: Math.min(maxFontSize, height / (maxLines * lineHeight)),
				validateFontIsLoaded: true,
			}),
		);
		if (fitted.some((result) => result.lines.length === 0)) {
			return null;
		}

		const fontSize = Math.min(...fitted.map((result) => result.fontSize));
		const lines = fitted.flatMap((result) => result.lines);
		const textMeasurements = lines.map((text) =>
			measureText({
				text,
				fontFamily,
				fontSize,
				fontWeight,
				additionalStyles: {lineHeight},
				validateFontIsLoaded: true,
			}),
		);

		return {
			fontSize,
			lines,
			...createRoundedTextBox({
				textMeasurements,
				textAlign: 'center',
				horizontalPadding,
				borderRadius,
			}),
		};
	}, [fontFamily, height, page, width]);

	if (!layout) {
		return null;
	}

	return (
		<div
			style={{
				position: 'relative',
				width: layout.boundingBox.width,
				height: layout.boundingBox.height,
				flexShrink: 0,
			}}
		>
			<svg
				viewBox={layout.boundingBox.viewBox}
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: layout.boundingBox.width,
					height: layout.boundingBox.height,
					overflow: 'visible',
				}}
			>
				<path fill="#ffffff" d={layout.d} />
			</svg>
			<div style={{position: 'relative'}}>
				{layout.lines.map((line, index) => (
					<div
						key={index}
						style={{
							color: '#000000',
							fontFamily,
							fontSize: layout.fontSize,
							fontWeight,
							lineHeight,
							paddingInline: horizontalPadding,
							textAlign: 'center',
							whiteSpace: 'pre',
						}}
					>
						{line}
					</div>
				))}
			</div>
		</div>
	);
};

const RoundedCaptionsInner = forwardRef<
	HTMLDivElement,
	RoundedCaptionsProps & {
		readonly controls: SequenceControls | undefined;
	}
>(
	(
		{
			captions,
			combineTokensWithinMilliseconds,
			controls,
			fontFamily,
			height = defaultHeight,
			name,
			playbackRate,
			style,
			trimBefore,
			width = defaultWidth,
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
				name={name ?? '<RoundedCaptions>'}
				trimBefore={trimBefore}
				outlineRef={outlineRef}
			>
				<div
					ref={outlineRef}
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
					<RoundedCaptionsContent
						captions={captions}
						combineTokensWithinMilliseconds={
							combineTokensWithinMilliseconds ??
							defaultCombineTokensWithinMilliseconds
						}
						fontFamily={fontFamily}
						playbackRate={playbackRate ?? 1}
						trimBefore={trimBefore ?? 0}
						width={width}
						height={height}
					/>
				</div>
			</Sequence>
		);
	},
);

export const RoundedCaptions = Interactive.withSchema({
	Component: RoundedCaptionsInner,
	componentName: '<RoundedCaptions>',
	schema: roundedCaptionsSchema,
	supportsEffects: false,
}) as React.FC<RoundedCaptionsProps>;
