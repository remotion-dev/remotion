import type {CodemodProject} from './codemod-project';
import {
	type CompositionTarget,
	requireComposition,
} from './composition-editing';
import {getNodeProps} from './get-node-props';
import type {CodemodNodeResult} from './node-references';
import {updateCompositionMetadata} from './update-composition-metadata';

export const extendCompositionDuration = <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
	minDurationInFrames,
}: CompositionTarget & {
	project: Project;
	minDurationInFrames: number;
}): CodemodNodeResult & {logLine: number | null} => {
	let node: ReturnType<typeof requireComposition>;
	try {
		node = requireComposition({project, compositionFile, compositionId});
	} catch {
		return {changes: [], nodePathRemappings: [], logLine: null};
	}

	const {durationInFrames} = getNodeProps({
		project,
		node,
		keys: ['durationInFrames'],
	}).props;
	if (
		node.tagName === 'Still' ||
		durationInFrames?.status !== 'static' ||
		typeof durationInFrames.codeValue !== 'number' ||
		durationInFrames.codeValue >= minDurationInFrames
	) {
		return {changes: [], nodePathRemappings: [], logLine: null};
	}

	const {changes, nodePathRemappings} = updateCompositionMetadata({
		project,
		compositionFile,
		compositionId,
		metadata: {durationInFrames: minDurationInFrames},
	});
	return {
		changes,
		nodePathRemappings,
		logLine: node.location?.line ?? null,
	};
};
