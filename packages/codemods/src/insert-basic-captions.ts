import type {ElementInitialProps} from '@remotion/studio-protocol';
import type {InsertBasicCaptionsRequest} from '@remotion/studio-shared';
import {addComposition} from './add-composition';
import {
	basicCaptionsElementSource,
	getBasicCaptionsElementFile,
} from './basic-captions-element-source';
import {getCodemodResult, type CodemodProject} from './codemod-project';
import {getTreeEntries} from './folder-editing';
import {captureJsxNodePaths} from './get-node-path-remappings';
import {insertBasicCaptions as insertBasicCaptionsInSource} from './insert-basic-captions-in-source';
import {findProjectFile} from './internals';
import {
	getInsertedNodeReferences,
	getNodeEditResult,
	getUpdatedNodeReference,
	type NodeReference,
} from './node-references';
import {getRegistrationPathChanges} from './precompose-jsx-nodes';
import {recastLocToOffset} from './recast-loc-to-offset';
import {parseAst} from './sequence-props/parse-ast';
import {applySourceEdits} from './source-edits';

export type InsertBasicCaptionsOptions<Project extends CodemodProject> = {
	project: Project;
	node: NodeReference;
	captions: readonly Parameters<
		typeof insertBasicCaptionsInSource
	>[0]['captions'][number][];
	durationInFrames?: number | null;
	composition: InsertBasicCaptionsRequest['composition'];
	importPath: string | null;
	element?: {
		componentName: string;
		initialProps: ElementInitialProps | null;
	} | null;
	prettierConfigOverride?: Record<string, unknown> | null;
};

export const insertBasicCaptions = <Project extends CodemodProject>({
	project,
	node,
	captions,
	durationInFrames = null,
	composition,
	importPath,
	element = null,
	prettierConfigOverride = null,
}: InsertBasicCaptionsOptions<Project>) => {
	const filePath = findProjectFile({project, filePath: node.filePath});
	const companion =
		importPath === null
			? getBasicCaptionsElementFile({
					fileName: filePath,
					readFileContents: (file) => project.files[file] ?? null,
				})
			: null;
	if (element !== null && importPath === null)
		throw new Error('A custom caption element requires an importPath');
	const edit = insertBasicCaptionsInSource({
		input: project.files[filePath],
		nodePath: node.nodePath,
		captions: [...captions],
		durationInFrames,
		importPath: importPath ?? companion!.importPath,
		element,
		prettierConfigOverride,
	});
	let result = getNodeEditResult({project, edits: [{filePath, ...edit}]});
	let newCompositionId: string | null = null;
	if (composition !== null && edit.componentName !== null) {
		try {
			const registrationFile = findProjectFile({
				project,
				filePath: composition.fileName,
			});
			const ast = parseAst(edit.output);
			const declaration = ast.program.body.find(
				(statement) =>
					statement.type === 'VariableDeclaration' &&
					statement.declarations.some(
						(item) =>
							item.id.type === 'Identifier' &&
							item.id.name === edit.componentName,
					),
			);
			if (!declaration?.loc) {
				throw new Error('Could not export the captioned source');
			}

			const start = recastLocToOffset(edit.output, declaration.loc.start);
			const exportedSource = applySourceEdits({
				input: edit.output,
				edits: [{start, end: start, replacement: 'export '}],
			});
			const registrationProject = {
				...project,
				files: {...project.files, [filePath]: exportedSource},
			};
			const existingIds = new Set([
				...composition.existingCompositionIds,
				...getTreeEntries({
					ast: parseAst(registrationProject.files[registrationFile]),
				}).flatMap(({item}) =>
					item.type === 'composition' ? [item.compositionId] : [],
				),
			]);
			let compositionId = edit.componentName;
			for (let suffix = 2; existingIds.has(compositionId); suffix++) {
				compositionId = `${edit.componentName}${suffix}`;
			}

			const registrationDir = registrationFile
				.replaceAll('\\', '/')
				.split('/')
				.slice(0, -1);
			const sourceParts = filePath.replaceAll('\\', '/').split('/');
			while (
				registrationDir.length > 0 &&
				registrationDir[0] === sourceParts[0]
			) {
				registrationDir.shift();
				sourceParts.shift();
			}

			const relativeSource = [
				...registrationDir.map(() => '..'),
				...sourceParts,
			]
				.join('/')
				.replace(/\.(?:tsx?|jsx?|mjs)$/, '');
			const registration = addComposition({
				project: registrationProject,
				compositionFile: registrationFile,
				compositionId,
				component: {
					importName: edit.componentName,
					importPath:
						registrationFile === filePath
							? null
							: relativeSource.startsWith('.')
								? relativeSource
								: `./${relativeSource}`,
				},
				metadata: composition.metadata,
			});
			const registrationOutput = registration.changes[0]?.nextContents;
			if (!registrationOutput) {
				throw new Error('Could not register the captioned source');
			}

			const paths = getRegistrationPathChanges({
				before: registrationProject.files[registrationFile],
				after: registrationOutput,
				compositionId,
			});
			if (registrationFile === filePath) {
				const initialPaths = captureJsxNodePaths(
					parseAst(project.files[filePath]),
				);
				const firstPhase = new Map(
					edit.nodePathRemappings
						.filter(({oldNodePath}) => oldNodePath !== null)
						.map((entry) => [JSON.stringify(entry.oldNodePath), entry]),
				);
				result = getNodeEditResult({
					project,
					edits: [
						{
							filePath,
							output: registrationOutput,
							nodePathRemappings: [
								...initialPaths.map(({nodePath}) => {
									const previous = firstPhase.get(JSON.stringify(nodePath));
									const intermediate = previous
										? previous.newNodePath
										: nodePath;
									return {
										...previous,
										oldNodePath: nodePath,
										newNodePath:
											intermediate === null
												? null
												: paths.byOriginalPath.get(
														JSON.stringify(intermediate),
													)!,
									};
								}),
								...edit.nodePathRemappings
									.filter(
										({oldNodePath, newNodePath}) =>
											oldNodePath === null && newNodePath !== null,
									)
									.map((entry) => ({
										...entry,
										newNodePath: paths.byOriginalPath.get(
											JSON.stringify(entry.newNodePath),
										)!,
									})),
								{oldNodePath: null, newNodePath: paths.insertedPath},
							],
						},
					],
				});
			} else {
				result = getNodeEditResult({
					project,
					edits: [
						{filePath, ...edit, output: exportedSource},
						{
							filePath: registrationFile,
							output: registrationOutput,
							nodePathRemappings: registration.nodePathRemappings,
						},
					],
				});
			}

			newCompositionId = compositionId;
		} catch {
			// Keep the grouped source when its registration cannot be edited safely.
		}
	}

	return {
		...result,
		newCompositionId,
		changes: [
			...result.changes,
			...getCodemodResult({
				project,
				edits: companion?.shouldWrite
					? [
							{
								filePath: companion.fileName,
								nextContents: basicCaptionsElementSource,
							},
						]
					: [],
			}).changes,
		],
		updatedNode: getUpdatedNodeReference({project, ...result, node}),
		insertedNodes: getInsertedNodeReferences(result.nodePathRemappings),
		editDetails: [{filePath, logLine: edit.logLine}],
	};
};
