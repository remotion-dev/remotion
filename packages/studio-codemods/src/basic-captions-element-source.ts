export const basicCaptionsElementSource = `import React, {forwardRef, useImperativeHandle, useMemo, useRef} from 'react';
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

type Caption = {
	text: string;
	startMs: number;
	endMs: number;
	timestampMs: number | null;
	confidence: number | null;
	pageBreakAfter?: boolean;
};

type BasicCaptionsProps = InteractiveBaseProps &
	InteractiveTransformProps &
	Pick<SequenceProps, 'from' | 'durationInFrames' | 'trimBefore' | 'width' | 'height'> & {
		readonly captions: Caption[];
		readonly playbackRate?: number;
		readonly combineTokensWithinMilliseconds?: number;
	};

const BasicCaptionsContent: React.FC<{
	readonly captions: Caption[];
	readonly playbackRate: number;
	readonly combineTokensWithinMilliseconds: number;
}> = ({captions, playbackRate, combineTokensWithinMilliseconds}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pages = useMemo(() => {
		const result: {text: string; startMs: number; durationMs: number}[] = [];
		let text = '';
		let startMs = 0;
		let endMs = 0;
		const add = () => {
			result.push({text: text.trim(), startMs, durationMs: 0});
		};

		for (const caption of captions) {
			if (
				text &&
				caption.text.startsWith(' ') &&
				endMs - startMs > combineTokensWithinMilliseconds
			) {
				add();
				text = '';
			}
			if (!text) {
				startMs = caption.startMs;
			}
			text = (text + caption.text).trimStart();
			endMs = caption.endMs;
			if (caption.pageBreakAfter && text) {
				add();
				text = '';
			}
		}
		if (text) {
			add();
		}
		for (let i = 0; i < result.length; i++) {
			result[i].durationMs =
				i + 1 < result.length
					? result[i + 1].startMs - result[i].startMs
					: endMs - result[i].startMs;
		}
		return result;
	}, [captions, combineTokensWithinMilliseconds]);
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
			{page.text}
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
			combineTokensWithinMilliseconds = 2000,
			controls,
			durationInFrames,
			from,
			height = 220,
			name,
			playbackRate = 1,
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
					<BasicCaptionsContent
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
`;

export const getBasicCaptionsElementFile = ({
	fileName,
	readFileContents,
}: {
	fileName: string;
	readFileContents: (fileName: string) => string | null;
}): {
	fileName: string;
	importPath: string;
	shouldWrite: boolean;
} => {
	const separatorIndex = Math.max(
		fileName.lastIndexOf('/'),
		fileName.lastIndexOf('\\'),
	);
	const directory = fileName.slice(0, separatorIndex + 1);
	for (let index = 0; index < 1000; index++) {
		const baseName = `basic-captions${index === 0 ? '' : `-${index + 1}`}.element`;
		const candidate = `${directory}${baseName}.tsx`;
		const existing = readFileContents(candidate);
		if (existing === null || existing === basicCaptionsElementSource) {
			return {
				fileName: candidate,
				importPath: `./${baseName}`,
				shouldWrite: existing === null,
			};
		}
	}

	throw new Error('Could not find an available filename for Basic captions');
};
