import type {File} from '@babel/types';
import {
	type RemovedProp,
	type SequencePropsNodeUpdate,
	type SequencePropsNodeUpdateResult,
	type SequencePropUpdate,
	updateMultipleSequenceProps as updateMultipleSequencePropsCodemod,
	updateSequencePropsAst,
} from '@remotion/codemods/internal';
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
	updateSequencePropsAst,
};

type PrettierConfigOverride = Record<string, unknown> | null;

type UpdateMultipleSequencePropsResult = {
	output: string;
	formatted: boolean;
	results: SequencePropsNodeUpdateResult[];
	ast: File;
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
	ast: providedAst,
}: {
	input: string;
	changes: SequencePropsNodeUpdate[];
	prettierConfigOverride: PrettierConfigOverride;
	ast?: File;
}): Promise<UpdateMultipleSequencePropsResult> => {
	return Promise.resolve().then(() => {
		const {output, results, ast} = updateMultipleSequencePropsCodemod({
			input,
			changes,
			ast: providedAst,
			prettierConfigOverride,
		});

		return {output, formatted: true, results, ast};
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
