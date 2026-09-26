import {
	updateMultipleNodeProps,
	type RemovedProp,
	type SequencePropsNodeUpdate,
	type SequencePropsNodeUpdateResult,
	type SequencePropUpdate,
} from '@remotion/codemods';
import type {
	InteractivitySchema,
	SequenceNodePath,
	VideoConfigValues,
} from 'remotion';

export {
	type RemovedProp,
	type SequencePropsNodeUpdate,
	type SequencePropsNodeUpdateResult,
	type SequencePropUpdate,
};

type PrettierConfigOverride = Record<string, unknown> | null;

type UpdateMultipleSequencePropsResult = {
	output: string;
	formatted: boolean;
	results: SequencePropsNodeUpdateResult[];
};

type UpdateSequencePropsResult = {
	output: string;
	oldValueStrings: string[];
	formatted: boolean;
	logLine: number;
	removedProps: RemovedProp[];
};

export const updateMultipleSequenceProps = ({
	input,
	changes,
	prettierConfigOverride,
}: {
	input: string;
	changes: SequencePropsNodeUpdate[];
	prettierConfigOverride: PrettierConfigOverride;
}): Promise<UpdateMultipleSequencePropsResult> => {
	return Promise.resolve().then(() => {
		const result = updateMultipleNodeProps({
			project: {files: {'source.tsx': input}, rootDir: '/'},
			changes: changes.map(
				({nodePath, updates, schema, videoConfigValues}) => ({
					node: {filePath: 'source.tsx', nodePath},
					updates,
					schema,
					videoConfig: videoConfigValues ?? undefined,
				}),
			),
			prettierConfigOverride,
		});
		const output = result.changes[0]?.nextContents ?? input;
		const {results} = result;

		return {output, formatted: true, results};
	});
};

export const updateSequenceProps = async ({
	input,
	nodePath,
	updates,
	schema,
	prettierConfigOverride,
	videoConfigValues,
}: {
	input: string;
	nodePath: SequenceNodePath;
	updates: SequencePropUpdate[];
	schema: InteractivitySchema;
	prettierConfigOverride: PrettierConfigOverride;
	videoConfigValues: VideoConfigValues | null;
}): Promise<UpdateSequencePropsResult> => {
	const {output, results} = await updateMultipleSequenceProps({
		input,
		changes: [{nodePath, updates, schema, videoConfigValues}],
		prettierConfigOverride,
	});
	const result = results[0];
	if (!result) {
		throw new Error('Expected sequence prop update result');
	}

	return {
		output,
		oldValueStrings: result.oldValueStrings,
		formatted: true,
		logLine: result.logLine,
		removedProps: result.removedProps,
	};
};
