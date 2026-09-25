import {
	CodemodsInternals,
	applyCodemodChanges,
	getJsxNodeProps,
	updateMultipleJsxNodeProps,
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
}): {
	project: VirtualProject;
	response: SaveSequencePropsResponse;
} => {
	if (
		request.edits.length === 0 &&
		(request.captionPatches?.length ?? 0) === 0
	) {
		throw new Error('No sequence prop edits to save');
	}

	const updateResult =
		request.edits.length > 0
			? updateMultipleJsxNodeProps({
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
	const updatedNodePaths = new Map<string, SequenceNodePath>();
	for (const [index, node] of (updateResult?.updatedNodes ?? []).entries()) {
		updatedNodePaths.set(
			`${node.filePath}:${JSON.stringify(request.edits[index].nodePath.nodePath)}`,
			node.nodePath,
		);
	}

	for (const captionPatch of request.captionPatches ?? []) {
		const absolutePath = findProjectFile({
			filePath: captionPatch.fileName,
			project,
		});
		nextFiles[absolutePath] = updateInlineCaptionPatches({
			input: nextFiles[absolutePath],
			nodePath: captionPatch.nodePath.nodePath,
			patches: captionPatch.patches,
		}).output;
	}

	const nextProject = {...project, files: nextFiles};
	const statusTargets = getStatusTargets(request);
	const results: SaveSequencePropsResult[] = statusTargets.map((target) => {
		const absolutePath = findProjectFile({
			filePath: target.fileName,
			project: nextProject,
		});
		const status = getJsxNodeProps({
			project: nextProject,
			keys: getAllSchemaKeys(target.schema),
			assetKeys: getAssetSchemaKeys(target.schema),
			node: {
				filePath: absolutePath,
				nodePath:
					updatedNodePaths.get(
						`${absolutePath}:${JSON.stringify(target.nodePath.nodePath)}`,
					) ?? target.nodePath.nodePath,
			},
			componentIdentity: null,
			effectKeys: [],
			videoConfig: target.nodePath.videoConfigValues ?? undefined,
		});

		return {
			fileName: target.fileName,
			nodePath: target.nodePath,
			props: status.props,
		};
	});
	const firstResult = results[0];
	if (!firstResult) {
		throw new Error('Could not compute sequence prop edit status');
	}

	return {
		project: nextProject,
		response: {
			canUpdate: true,
			results,
		},
	};
};
