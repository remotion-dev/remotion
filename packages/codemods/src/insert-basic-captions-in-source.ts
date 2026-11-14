import type {JSXElement, JSXFragment} from '@babel/types';
import type {ElementInitialProps} from '@remotion/studio-protocol';
import type {SequenceNodePathRemapping} from '@remotion/studio-shared';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {buildJsxElement} from './build-jsx-element';
import {findJsxElementPathForDeletion} from './delete-jsx-nodes-internal';
import {
	captureJsxNodePaths,
	getNodePathRemappings,
} from './get-node-path-remappings';
import {createElementFromInsertable} from './insertable-element';
import {canExtractJsxWithoutCapturedValues} from './precompose-jsx-nodes';
import {
	captureJsxAttributeSources,
	indentInsertedJsx,
	printInsertedJsx,
} from './print-jsx';
import {recastLocToOffset} from './recast-loc-to-offset';
import {
	ensureOfficialNamedImport,
	getImportedName,
} from './sequence-props/imports';
import {getJsxComponentIdentity} from './sequence-props/jsx-component-identity';
import {parseAst} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	captureImportSnapshots,
	getAdjacentJsxInsertionSourceEdit,
	getInsertImportSourceEdits,
	getJsxElementSourceForInsertion,
} from './source-edits';
import {
	getEndOfLine,
	getIndentationUnit,
	getLineIndent,
	getSourceFormattingConfig,
	indentContinuationLines,
} from './source-style';

export const insertBasicCaptions = ({
	input,
	nodePath,
	captions,
	element,
	durationInFrames,
	importPath = './basic-captions.element',
	prettierConfigOverride = null,
}: {
	input: string;
	nodePath: SequenceNodePath;
	element: {
		componentName: string;
		initialProps: ElementInitialProps | null;
	} | null;
	captions: {
		text: string;
		startMs: number;
		endMs: number;
		timestampMs: number | null;
		confidence: number | null;
		pageBreakAfter?: boolean;
	}[];
	durationInFrames: number | null;
	importPath?: string;
	prettierConfigOverride?: Record<string, unknown> | null;
}): {
	output: string;
	logLine: number;
	nodePathRemappings: SequenceNodePathRemapping[];
} => {
	const ast = parseAst(input);
	const captured = captureJsxNodePaths(ast);
	const importSnapshots = captureImportSnapshots(ast);
	const mediaPath = findJsxElementPathForDeletion(ast, nodePath);
	if (!mediaPath) {
		throw new Error('Could not find the selected audio or video element');
	}

	const media = mediaPath.node as JSXElement;
	if (media.openingElement.name.type !== 'JSXIdentifier') {
		throw new Error('The selected media tag cannot be transcribed');
	}

	const tagName = media.openingElement.name.name;
	const importedMedia = ast.program.body.some(
		(statement) =>
			statement.type === 'ImportDeclaration' &&
			statement.importKind !== 'type' &&
			(statement.source.value === 'remotion' ||
				statement.source.value === '@remotion/media') &&
			statement.specifiers.some(
				(specifier) =>
					specifier.type === 'ImportSpecifier' &&
					specifier.local.name === tagName &&
					[
						'Video',
						'Audio',
						'OffthreadVideo',
						'experimental_Video',
						'experimental_Audio',
					].includes(getImportedName(specifier)),
			),
	);
	if (!importedMedia) {
		throw new Error('The selected element is not a Remotion Video or Audio');
	}

	const extractSource =
		!media.openingElement.attributes.some(
			(attribute) =>
				attribute.type === 'JSXAttribute' &&
				attribute.name.type === 'JSXIdentifier' &&
				['ref', 'loop', 'freeze', 'trimAfter', 'startFrom', 'endAt'].includes(
					attribute.name.name,
				),
		) && canExtractJsxWithoutCapturedValues({input, nodePath});

	let owningTrackTag: string | null = null;
	let ancestor = mediaPath.parentPath;
	while (ancestor) {
		if (recast.types.namedTypes.Function.check(ancestor.node)) {
			break;
		}

		if (ancestor.node.type === 'JSXElement') {
			const {openingElement} = ancestor.node;
			const {name} = openingElement;
			if (name.type !== 'JSXIdentifier' || !/^[a-z]/.test(name.name)) {
				let root = name;
				while (root.type === 'JSXMemberExpression') {
					root = root.object;
				}

				if (
					root.type === 'JSXIdentifier' &&
					ancestor.scope.lookup(root.name)?.path.node === ast.program &&
					getJsxComponentIdentity({ast, jsxElement: openingElement}) ===
						'dev.remotion.remotion.Track'
				) {
					owningTrackTag = recast.print(name).code;
				}

				break;
			}
		}

		ancestor = ancestor.parentPath;
	}

	const timingProps = [
		'from',
		'durationInFrames',
		'trimBefore',
		'playbackRate',
		'premountFor',
		'postmountFor',
	];
	const mediaAttributes = media.openingElement.attributes.filter(
		(attribute) =>
			attribute.type === 'JSXAttribute' &&
			attribute.name.type === 'JSXIdentifier' &&
			timingProps.includes(attribute.name.name),
	);
	const copiedAttributes = extractSource
		? []
		: mediaAttributes.map((attribute) => recast.print(attribute).code);
	const fallbackTimingProps = [
		...(Number.isFinite(durationInFrames) &&
		durationInFrames !== null &&
		!mediaAttributes.some(
			(attribute) =>
				attribute.type === 'JSXAttribute' &&
				attribute.name.name === 'durationInFrames',
		)
			? [{name: 'durationInFrames', value: durationInFrames}]
			: []),
	];

	let elementSource: string;
	if (element === null) {
		const captionsLocalName = ensureOfficialNamedImport({
			ast,
			importedName: 'BasicCaptions',
			preferredLocalName: 'BasicCaptions',
			sourcePath: importPath,
		});
		copiedAttributes.push(
			...(extractSource
				? []
				: fallbackTimingProps.map(({name, value}) => `${name}={${value}}`)),
		);
		const formattingConfig = getSourceFormattingConfig({
			input,
			prettierConfigOverride,
		});
		const trailingComma =
			prettierConfigOverride?.trailingComma !== 'none' &&
			prettierConfigOverride?.trailingComma !== false;
		const singleLineElement = `<${captionsLocalName} captions={[]}${copiedAttributes.length === 0 ? '' : ` ${copiedAttributes.join(' ')}`} />`;
		const captionLines = captions.flatMap((caption, captionIndex) => {
			const doubleQuotedText = JSON.stringify(caption.text);
			const singleQuotedText = `'${doubleQuotedText
				.slice(1, -1)
				.replaceAll('\\"', '"')
				.replaceAll("'", "\\'")}'`;
			const singleQuotes = caption.text.match(/'/g)?.length ?? 0;
			const doubleQuotes = caption.text.match(/"/g)?.length ?? 0;
			const text =
				singleQuotes === doubleQuotes
					? formattingConfig.quote === 'single'
						? singleQuotedText
						: doubleQuotedText
					: singleQuotes < doubleQuotes
						? singleQuotedText
						: doubleQuotedText;
			const properties = [
				`text: ${text}`,
				`startMs: ${JSON.stringify(caption.startMs)}`,
				`endMs: ${JSON.stringify(caption.endMs)}`,
				`timestampMs: ${JSON.stringify(caption.timestampMs)}`,
				`confidence: ${JSON.stringify(caption.confidence)}`,
				...(caption.pageBreakAfter === undefined
					? []
					: [`pageBreakAfter: ${caption.pageBreakAfter}`]),
			];
			return [
				'{',
				...properties.map((property, propertyIndex) =>
					indentInsertedJsx({
						indent: formattingConfig.indentationUnit,
						insertion: `${property}${
							propertyIndex < properties.length - 1 || trailingComma ? ',' : ''
						}`,
					}),
				),
				`}${captionIndex < captions.length - 1 || trailingComma ? ',' : ''}`,
			].map((line) =>
				indentInsertedJsx({
					indent: formattingConfig.indentationUnit,
					insertion: line,
				}),
			);
		});
		const multilineElementLines = [
			`<${captionsLocalName}`,
			'captions={[',
			...captionLines,
			']}',
			...copiedAttributes,
			'/>',
		];
		elementSource =
			captions.length === 0 &&
			!singleLineElement.includes('\n') &&
			singleLineElement.length <= formattingConfig.printWidth
				? singleLineElement
				: multilineElementLines
						.map((line, index) =>
							index === 0 || index === multilineElementLines.length - 1
								? line
								: indentInsertedJsx({
										indent: formattingConfig.indentationUnit,
										insertion: line,
									}),
						)
						.join(formattingConfig.endOfLine);
	} else {
		const {style, ...initialProps} = element.initialProps ?? {};
		const jsx = buildJsxElement({
			ast,
			element: createElementFromInsertable({
				element: {
					type: 'component',
					componentName: element.componentName,
					importName: element.componentName,
					importPath,
					position: null,
					props: [
						...Object.entries(initialProps)
							.filter(
								([name]) => name !== 'captions' && !timingProps.includes(name),
							)
							.map(([name, value]) => ({name, value})),
						{name: 'captions', value: captions},
						...(extractSource ? [] : fallbackTimingProps),
						{
							name: 'style',
							value: {
								bottom: 120,
								left: '50%',
								transform: 'translateX(-50%)',
								...(typeof style === 'object' ? style : {}),
							},
						},
					],
				},
				from: null,
				wrapInSequence: null,
			}),
		});
		jsx.openingElement.attributes = [
			...(jsx.openingElement.attributes ?? []),
			...((extractSource ? [] : mediaAttributes) as never[]),
		];
		elementSource = printInsertedJsx({
			element: jsx,
			input,
			prettierConfigOverride,
			compactLiteralProps: true,
		});
	}

	if (!extractSource && owningTrackTag !== null) {
		const {endOfLine, indentationUnit} = getSourceFormattingConfig({
			input,
			prettierConfigOverride,
		});
		elementSource = [
			`<${owningTrackTag} name="Captions">`,
			indentInsertedJsx({indent: indentationUnit, insertion: elementSource}),
			`</${owningTrackTag}>`,
		].join(endOfLine);
	}

	const parsedElement = parseAst(`const element = (${elementSource});`).program
		.body[0];
	if (
		parsedElement?.type !== 'VariableDeclaration' ||
		parsedElement.declarations[0]?.init?.type !== 'JSXElement'
	) {
		throw new Error('Could not generate the Basic captions element');
	}

	const inserted = parsedElement.declarations[0].init;
	if (extractSource) {
		const occupiedNames = new Set<string>();
		recast.visit(ast, {
			visitIdentifier(path) {
				occupiedNames.add(path.node.name);
				this.traverse(path);
			},
			visitJSXIdentifier(path) {
				occupiedNames.add(path.node.name);
				this.traverse(path);
			},
		});
		const identity = getJsxComponentIdentity({
			ast,
			jsxElement: media.openingElement,
		});
		const baseName = identity?.endsWith('Audio')
			? 'CaptionedAudio'
			: 'CaptionedVideo';
		let componentName = baseName;
		for (
			let suffix = 2;
			occupiedNames.has(componentName) ||
			occupiedNames.has(`${componentName}Inner`);
			suffix++
		) {
			componentName = `${baseName}${suffix}`;
		}

		const interactiveName = ensureOfficialNamedImport({
			ast,
			importedName: 'Interactive',
			preferredLocalName: 'Interactive',
			sourcePath: 'remotion',
		});
		const originalAttributeSources = captureJsxAttributeSources(media);
		media.openingElement.attributes = media.openingElement.attributes.filter(
			(attribute) => !mediaAttributes.includes(attribute),
		);
		const mediaSource = printInsertedJsx({
			element: media as never,
			input,
			originalAttributeSources,
			prettierConfigOverride,
			compactLiteralProps: false,
		});
		const {endOfLine, indentationUnit, quote, semi, trailingComma} =
			getSourceFormattingConfig({input, prettierConfigOverride});
		const indent = (insertion: string) =>
			indentInsertedJsx({indent: indentationUnit, insertion});
		const semicolon = semi ? ';' : '';
		const quoteCharacter = quote === 'single' ? "'" : '"';
		const componentSource = [
			`const ${componentName}Inner = () => {`,
			indent(
				[
					'return (',
					indent(
						['<>', indent(mediaSource), indent(elementSource), '</>'].join(
							endOfLine,
						),
					),
					`)${semicolon}`,
				].join(endOfLine),
			),
			`}${semicolon}`,
			'',
			`const ${componentName} = ${interactiveName}.create({`,
			indent(`Component: ${componentName}Inner,`),
			indent(
				`layout: ${quoteCharacter}absolute-fill${quoteCharacter}${trailingComma ? ',' : ''}`,
			),
			`})${semicolon}`,
		].join(endOfLine);
		const declarations = parseAst(componentSource).program.body;
		const contentDeclaration = declarations[0];
		if (
			contentDeclaration.type !== 'VariableDeclaration' ||
			contentDeclaration.declarations[0].init?.type !==
				'ArrowFunctionExpression' ||
			contentDeclaration.declarations[0].init.body.type !== 'BlockStatement'
		) {
			throw new Error('Could not create the captioned source component');
		}

		const returnStatement =
			contentDeclaration.declarations[0].init.body.body[0];
		if (
			returnStatement.type !== 'ReturnStatement' ||
			returnStatement.argument?.type !== 'JSXFragment'
		) {
			throw new Error('Could not create the captioned source contents');
		}

		returnStatement.argument.children = [media, inserted];
		const instanceSource = `<${componentName}${[
			...mediaAttributes.map((attribute) => recast.print(attribute).code),
			...fallbackTimingProps.map(({name, value}) => `${name}={${value}}`),
		]
			.map((attribute) => ` ${attribute}`)
			.join('')} />`;
		const instanceDeclaration = parseAst(
			`const instance = (${instanceSource});`,
		).program.body[0];
		if (
			instanceDeclaration.type !== 'VariableDeclaration' ||
			instanceDeclaration.declarations[0].init?.type !== 'JSXElement' ||
			!media.loc
		) {
			throw new Error('Could not create the captioned source instance');
		}

		mediaPath.replace(instanceDeclaration.declarations[0].init);
		ast.program.body.push(...declarations);
		const start = recastLocToOffset(input, media.loc.start);
		const outputWithSource = applySourceEdits({
			input,
			edits: [
				...getInsertImportSourceEdits({
					ast,
					input,
					prettierConfigOverride,
					snapshots: importSnapshots,
				}),
				{
					start,
					end: recastLocToOffset(input, media.loc.end),
					replacement: indentContinuationLines({
						input,
						indent: getLineIndent({input, offset: start}),
						printed: printInsertedJsx({
							element: instanceDeclaration.declarations[0].init as never,
							input,
							prettierConfigOverride,
							compactLiteralProps: false,
						}),
					}),
				},
				{
					start: input.length,
					end: input.length,
					replacement: `${input.endsWith(endOfLine) ? endOfLine : endOfLine + endOfLine}${componentSource}${endOfLine}`,
				},
			],
		});
		return {
			output: outputWithSource,
			logLine: media.openingElement.loc?.start.line ?? 1,
			nodePathRemappings: getNodePathRemappings({
				ast,
				captured,
				output: outputWithSource,
			}).nodePathRemappings,
		};
	}

	const parent = mediaPath.parentPath?.node;
	if (!parent) {
		throw new Error('Could not locate the media element parent');
	}

	let sourceEdit;
	if (
		(parent.type === 'JSXElement' || parent.type === 'JSXFragment') &&
		parent.children.includes(media)
	) {
		const index = parent.children.indexOf(media);
		parent.children.splice(index + 1, 0, inserted);
		sourceEdit = getAdjacentJsxInsertionSourceEdit({
			input,
			insertion: elementSource,
			position: 'after',
			target: media,
		});
	} else {
		const fragment: JSXFragment = {
			type: 'JSXFragment',
			openingFragment: {type: 'JSXOpeningFragment'},
			closingFragment: {type: 'JSXClosingFragment'},
			children: [media, inserted],
		};
		mediaPath.replace(fragment);
		if (!media.loc) {
			throw new Error('Could not locate the media element in source');
		}

		const start = recastLocToOffset(input, media.loc.start);
		const end = recastLocToOffset(input, media.loc.end);
		const indent = getLineIndent({input, offset: start});
		const unit = getIndentationUnit(input, prettierConfigOverride);
		const eol = getEndOfLine(input);
		sourceEdit = {
			start,
			end,
			replacement: indentContinuationLines({
				indent,
				input,
				printed: [
					'<>',
					indentInsertedJsx({
						indent: unit,
						insertion: getJsxElementSourceForInsertion({element: media, input}),
					}),
					indentInsertedJsx({indent: unit, insertion: elementSource}),
					'</>',
				].join(eol),
			}),
		};
	}

	const output = applySourceEdits({
		input,
		edits: [
			...getInsertImportSourceEdits({
				ast,
				input,
				prettierConfigOverride,
				snapshots: importSnapshots,
			}),
			sourceEdit,
		],
	});
	const {nodePathRemappings} = getNodePathRemappings({
		ast,
		captured,
		output,
	});
	return {
		output,
		logLine: media.openingElement.loc?.start.line ?? 1,
		nodePathRemappings,
	};
};
