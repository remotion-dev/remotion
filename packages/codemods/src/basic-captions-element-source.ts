import {parseAst} from './sequence-props/parse-ast';

export const basicCaptionsElementSource = `import type {Caption} from '@remotion/captions';
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
	Pick<SequenceProps, 'from' | 'durationInFrames' | 'trimBefore' | 'width' | 'height'> & {
		readonly captions: Caption[];
		readonly playbackRate?: number;
		readonly combineTokensWithinMilliseconds?: number;
	};

const BasicCaptionsContent: React.FC<{
	readonly captions: Caption[];
	readonly playbackRate: number;
	readonly trimBefore: number;
	readonly combineTokensWithinMilliseconds: number;
}> = ({captions, playbackRate, trimBefore, combineTokensWithinMilliseconds}) => {
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
		const elementRef = useRef<HTMLDivElement>(null);
		useImperativeHandle(ref, () => elementRef.current as HTMLDivElement, []);

		return (
			<Sequence
				layout="none"
				{...interactiveProps}
				controls={controls}
				name={name ?? 'Basic captions'}
				from={from}
				durationInFrames={durationInFrames}
				trimBefore={trimBefore}
			>
				<div
					ref={elementRef}
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
						trimBefore={trimBefore ?? 0}
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
		let exportsBasicCaptions = false;
		if (existing !== null) {
			try {
				const ast = parseAst(existing);
				exportsBasicCaptions = ast.program.body.some((statement) => {
					if (statement.type !== 'ExportNamedDeclaration') {
						return false;
					}

					const {declaration} = statement;
					if (declaration?.type === 'VariableDeclaration') {
						return declaration.declarations.some(
							(item) =>
								item.id.type === 'Identifier' &&
								item.id.name === 'BasicCaptions',
						);
					}

					if (
						declaration?.type === 'FunctionDeclaration' ||
						declaration?.type === 'ClassDeclaration'
					) {
						return declaration.id?.name === 'BasicCaptions';
					}

					return statement.specifiers.some(
						(specifier) =>
							(specifier.type === 'ExportSpecifier' &&
								specifier.exported.type === 'Identifier' &&
								specifier.exported.name === 'BasicCaptions') ||
							(specifier.type === 'ExportSpecifier' &&
								specifier.exported.type === 'StringLiteral' &&
								specifier.exported.value === 'BasicCaptions'),
					);
				});
			} catch {
				// Keep a malformed or unrelated file untouched and use another name.
			}
		}

		if (existing === null || exportsBasicCaptions) {
			return {
				fileName: candidate,
				importPath: `./${baseName}`,
				shouldWrite: existing === null,
			};
		}
	}

	throw new Error('Could not find an available filename for Basic captions');
};
