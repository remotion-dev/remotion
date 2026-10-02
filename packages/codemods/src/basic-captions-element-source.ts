import {parseAst} from './sequence-props/parse-ast';

export const basicCaptionsElementSource = `import type {Caption} from '@remotion/captions';
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
	Pick<SequenceProps, 'width'> & {
		readonly captions: Caption[];
		readonly combineTokensWithinMilliseconds?: number;
	};

const BasicCaptionsContent: React.FC<BasicCaptionsProps> = ({
	captions,
	combineTokensWithinMilliseconds = 3000,
	style,
	width = 900,
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
	const currentTimeMs = (frame / fps) * 1000;
	const page = pages.find(
		(candidate) =>
			currentTimeMs >= candidate.startMs &&
			currentTimeMs < candidate.startMs + candidate.durationMs,
	);

	return (
		<div
			style={{
				alignItems: 'center',
				display: 'flex',
				justifyContent: 'center',
				position: 'absolute',
				bottom: 120,
				left: '50%',
				transform: 'translateX(-50%)',
				width,
				...style,
			}}
		>
			{page ? (
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
			) : null}
		</div>
	);
};

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
	combineTokensWithinMilliseconds: {
		type: 'number',
		min: 0,
		step: 50,
		default: 3000,
		description: 'Time between caption pages',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export const BasicCaptions = Interactive.withSchema({
	Component: BasicCaptionsContent,
	componentName: '<BasicCaptions>',
	schema: basicCaptionsSchema,
	wrapInSequence: true,
});
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
