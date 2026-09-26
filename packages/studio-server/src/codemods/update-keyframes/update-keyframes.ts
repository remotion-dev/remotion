import {
	updateNodeKeyframes,
	updateEffectKeyframes as updateEffectKeyframesInProject,
	type EffectKeyframeUpdate,
	type IntroducedKeyframeIdentifiers,
	type KeyframeOperation,
	type SequenceKeyframeUpdate,
} from '@remotion/codemods';
import type {
	InteractivitySchema,
	SequenceNodePath,
	VideoConfigValues,
} from 'remotion';

export type {
	EffectKeyframeUpdate,
	IntroducedKeyframeIdentifiers,
	KeyframeOperation,
	SequenceKeyframeUpdate,
};

type KeyframeInput = {
	input: string;
	updates: SequenceKeyframeUpdate[];
	schema?: InteractivitySchema;
	prettierConfigOverride?: Record<string, unknown> | null;
	videoConfigValues: VideoConfigValues | null;
};

export const updateSequenceKeyframes = async ({
	input,
	nodePath,
	videoConfigValues,
	...options
}: KeyframeInput & {nodePath: SequenceNodePath}) => {
	const result = await updateNodeKeyframes({
		project: {files: {'source.tsx': input}, rootDir: '/'},
		node: {filePath: 'source.tsx', nodePath},
		videoConfig: videoConfigValues ?? undefined,
		...options,
	});
	return {...result, output: result.changes[0]?.nextContents ?? input};
};

export const updateEffectKeyframes = async ({
	input,
	sequenceNodePath,
	effectIndex,
	videoConfigValues,
	...options
}: KeyframeInput & {
	sequenceNodePath: SequenceNodePath;
	effectIndex: number;
}) => {
	const result = await updateEffectKeyframesInProject({
		project: {files: {'source.tsx': input}, rootDir: '/'},
		effect: {filePath: 'source.tsx', nodePath: sequenceNodePath, effectIndex},
		videoConfig: videoConfigValues ?? undefined,
		...options,
	});
	return {...result, output: result.changes[0]?.nextContents ?? input};
};
