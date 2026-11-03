import {
	CodemodsInternals,
	applyCodemodChanges,
	getNodeProps,
	type CodemodNodeResult,
	updateMultipleNodeProps,
} from '@remotion/codemods';
import type {
	SaveSequencePropEdit,
	SaveSequencePropsRequest,
	SaveSequencePropsResponse,
	SaveSequencePropsResult,
} from '@remotion/studio-shared';
import {getAllSchemaKeys, getAssetSchemaKeys} from '@remotion/studio-shared';
import type {SequenceNodePath} from 'remotion';
import type {VirtualProject} from './types';

const {findProjectFile, updateInlineCaptionPatches} = CodemodsInternals;

const parseSequencePropEditValue = (
	value: SaveSequencePropEdit['value'],
): unknown => {
	if (value.type === 'undefined') {
		return undefined;
	}

	return JSON.parse(value.serialized);
};

const getStatusTargets = (request: SaveSequencePropsRequest) => {
	return [
		...new Map(
			[...request.edits, ...(request.captionPatches ?? [])].map((target) => [
				JSON.stringify(target.nodePath),
				target,
			]),
		).values(),
	];
};

export const saveSequencePropsInProject = ({
	project,
	request,
}: {
	project: VirtualProject;
	request: SaveSequencePropsRequest;
}) => {
	if (
		request.edits.length === 0 &&
		(request.captionPatches?.length ?? 0) === 0
	) {
		throw new Error('No sequence prop edits to save');
	}

	const updateResult =
		request.edits.length > 0
			? updateMultipleNodeProps({
					project,
					changes: request.edits.map((edit) => ({
						node: {filePath: edit.fileName, nodePath: edit.nodePath.nodePath},
						updates: [
							{
								key: edit.key,
								...(edit.sourceEdit?.type === 'playback-rate'
									? {retimeKeyframes: true}
									: {}),
								value: parseSequencePropEditValue(edit.value),
								defaultValue:
									edit.defaultValue === null
										? null
										: JSON.parse(edit.defaultValue),
								googleFont:
									edit.sourceEdit?.type === 'google-font'
										? edit.sourceEdit.font
										: null,
								clipboardParam:
									edit.sourceEdit?.type === 'clipboard-param'
										? edit.sourceEdit.param
										: null,
							},
						],
						schema: edit.schema,
						videoConfig: edit.nodePath.videoConfigValues ?? undefined,
					})),
				})
			: null;
	const nextFiles = {
		...applyCodemodChanges(project, updateResult?.changes ?? []).files,
	};
	const nodePathRemappings: CodemodNodeResult['nodePathRemappings'] = [
		...(updateResult?.nodePathRemappings ?? []),
	];
	for (const captionPatch of request.captionPatches ?? []) {
		const absolutePath = findProjectFile({
			filePath: captionPatch.fileName,
			project,
		});
		const oldNodePath = captionPatch.nodePath.nodePath;
		const remapping = nodePathRemappings.find(
			(entry) =>
				entry.filePath === absolutePath &&
				JSON.stringify(entry.oldNodePath) === JSON.stringify(oldNodePath),
		);
		if (remapping?.newNodePath === null)
			throw new Error('The caption node was removed');
		nextFiles[absolutePath] = updateInlineCaptionPatches({
			input: nextFiles[absolutePath],
			nodePath: remapping?.newNodePath ?? oldNodePath,
			patches: captionPatch.patches,
		}).output;
		if (!remapping)
			nodePathRemappings.push({
				filePath: absolutePath,
				oldNodePath,
				newNodePath: oldNodePath,
			});
	}

	const changedFiles = [
		...new Set([
			...(updateResult?.changes ?? []).map(({filePath}) => filePath),
			...nodePathRemappings.map(({filePath}) => filePath),
		]),
	];
	return {
		changes: changedFiles.map((filePath) => ({
			filePath,
			previousContents: project.files[filePath],
			nextContents: nextFiles[filePath],
		})),
		nodePathRemappings,
		getResponse: (
			finalProject: VirtualProject,
			currentPath: (
				filePath: string,
				original: SequenceNodePath,
			) => SequenceNodePath,
		): SaveSequencePropsResponse => {
			const results: SaveSequencePropsResult[] = getStatusTargets(request).map(
				(target) => {
					const absolutePath = findProjectFile({
						filePath: target.fileName,
						project: finalProject,
					});
					const nodePath = currentPath(absolutePath, target.nodePath.nodePath);
					const status = getNodeProps({
						project: finalProject,
						keys: getAllSchemaKeys(target.schema),
						assetKeys: getAssetSchemaKeys(target.schema),
						node: {filePath: absolutePath, nodePath},
						componentIdentity: null,
						effectKeys: [],
					});
					return {
						fileName: target.fileName,
						nodePath: {...target.nodePath, absolutePath, nodePath},
						props: status.props,
					};
				},
			);
			return {canUpdate: true, results};
		},
	};
};
