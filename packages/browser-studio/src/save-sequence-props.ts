import {
	computeSequencePropsStatusFromContent,
	findProjectFile,
	updateInlineCaptionPatches,
	type SequencePropsNodeUpdate,
	updateMultipleSequenceProps,
} from '@remotion/studio-codemods';
import type {
	SaveSequencePropEdit,
	SaveSequencePropsRequest,
	SaveSequencePropsResponse,
	SaveSequencePropsResult,
} from '@remotion/studio-shared';
import {getAllSchemaKeys, getAssetSchemaKeys} from '@remotion/studio-shared';
import type {VirtualProject} from './types';

const parseSequencePropEditValue = (
	value: SaveSequencePropEdit['value'],
): unknown => {
	if (value.type === 'undefined') {
		return undefined;
	}

	return JSON.parse(value.serialized);
};

const hasKeyframeChanges = (request: SaveSequencePropsRequest) => {
	return (
		(request.addedKeyframes?.length ?? 0) > 0 ||
		(request.movedKeyframes?.sequenceKeyframes.length ?? 0) > 0 ||
		(request.movedKeyframes?.effectKeyframes.length ?? 0) > 0
	);
};

type FileMutation = {
	edits: SaveSequencePropEdit[];
	captionPatches: NonNullable<SaveSequencePropsRequest['captionPatches']>;
};

const getFileMutation = (
	mutations: Map<string, FileMutation>,
	absolutePath: string,
) => {
	const existing = mutations.get(absolutePath);
	if (existing) {
		return existing;
	}

	const created: FileMutation = {edits: [], captionPatches: []};
	mutations.set(absolutePath, created);
	return created;
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
	if (hasKeyframeChanges(request)) {
		throw new Error(
			'Browser Studio does not support saving sequence keyframes yet',
		);
	}

	if (
		request.edits.length === 0 &&
		(request.captionPatches?.length ?? 0) === 0
	) {
		throw new Error('No sequence prop edits to save');
	}

	const mutations = new Map<string, FileMutation>();
	for (const edit of request.edits) {
		const absolutePath = findProjectFile({
			filePath: edit.fileName,
			project,
		});
		getFileMutation(mutations, absolutePath).edits.push(edit);
	}

	for (const captionPatch of request.captionPatches ?? []) {
		const absolutePath = findProjectFile({
			filePath: captionPatch.fileName,
			project,
		});
		getFileMutation(mutations, absolutePath).captionPatches.push(captionPatch);
	}

	const nextFiles = {...project.files};
	for (const [absolutePath, mutation] of mutations) {
		let output = project.files[absolutePath];
		if (output === undefined) {
			throw new Error(`Could not find ${absolutePath}`);
		}

		if (mutation.edits.length > 0) {
			const changes: SequencePropsNodeUpdate[] = mutation.edits.map((edit) => ({
				nodePath: edit.nodePath.nodePath,
				updates: [
					{
						key: edit.key,
						value: parseSequencePropEditValue(edit.value),
						defaultValue:
							edit.defaultValue === null ? null : JSON.parse(edit.defaultValue),
						googleFont:
							edit.sourceEdit?.type === 'google-font'
								? edit.sourceEdit.font
								: null,
					},
				],
				schema: edit.schema,
				videoConfigValues: edit.nodePath.videoConfigValues,
			}));
			output = updateMultipleSequenceProps({input: output, changes}).output;
		}

		for (const captionPatch of mutation.captionPatches) {
			output = updateInlineCaptionPatches({
				input: output,
				nodePath: captionPatch.nodePath.nodePath,
				patches: captionPatch.patches,
			}).output;
		}

		nextFiles[absolutePath] = output;
	}

	const nextProject = {...project, files: nextFiles};
	const statusTargets = getStatusTargets(request);
	const results: SaveSequencePropsResult[] = statusTargets.map((target) => {
		const absolutePath = findProjectFile({
			filePath: target.fileName,
			project: nextProject,
		});
		const status = computeSequencePropsStatusFromContent({
			fileContents: nextFiles[absolutePath],
			keys: getAllSchemaKeys(target.schema),
			assetKeys: getAssetSchemaKeys(target.schema),
			nodePath: target.nodePath.nodePath,
			componentIdentity: null,
			effects: [],
			videoConfigValues: target.nodePath.videoConfigValues,
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
			props: firstResult.props,
			results,
		},
	};
};
