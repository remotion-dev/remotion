import type {CodemodProject} from './codemod-project';
import {getJsxNodes} from './get-jsx-nodes';
import {findProjectFile} from './internals';
import {
	getNodeEditResult,
	getUpdatedNodeReference,
	type JsxNodeReference,
} from './node-references';
import {splitVideoFromAudio} from './split-video-from-audio';

export type DetachAudioOptions<Project extends CodemodProject> = {
	project: Project;
	node: JsxNodeReference;
};

export const detachAudio = async <Project extends CodemodProject>({
	project,
	node,
}: DetachAudioOptions<Project>) => {
	const filePath = findProjectFile({project, filePath: node.filePath});
	const target = getJsxNodes({project, filePath}).find(
		(entry) => JSON.stringify(entry.nodePath) === JSON.stringify(node.nodePath),
	);
	if (
		!target?.componentIdentity ||
		!/^dev\.remotion\.(remotion\.(Video|OffthreadVideo|experimental_Video)|media\.Video)$/.test(
			target.componentIdentity,
		)
	) {
		throw new Error('Audio can only be detached from a Remotion video element');
	}

	const edit = await splitVideoFromAudio({
		input: project.files[filePath],
		nodePath: node.nodePath,
	});
	const result = getNodeEditResult({project, edits: [{filePath, ...edit}]});
	const nodePath = edit.nodePathRemappings.find(
		(entry) => entry.oldNodePath === null,
	)?.newNodePath;
	if (!nodePath) {
		throw new Error('Could not locate the detached audio element');
	}

	return {
		...result,
		editDetails: [
			{
				filePath,
				formatted: edit.formatted,
				nodeLabel: edit.nodeLabel,
				logLine: edit.logLine,
			},
		],
		insertedNode: {filePath, nodePath},
		updatedNode: getUpdatedNodeReference({project, ...result, node}),
	};
};
